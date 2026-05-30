import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProductCard } from '@/components/product-card';
import { Colors } from '@/constants/theme';
import { getCategoryIcon, productApi } from '@/services/api';
import { Category, Product } from '@/types';
import { styles } from './search-styles';

// Colour palette for the category grid cards
const CATEGORY_BG: Record<string, string> = {
  c1: '#FEE2E2',
  c2: '#DBEAFE',
  c3: '#FEF3C7',
  c4: '#D1FAE5',
  c5: '#FCE7F3',
  c6: '#EDE9FE',
  c7: '#CFFAFE',
  c8: '#F3F4F6',
};

const CATEGORY_ICON_COLOR: Record<string, string> = {
  c1: '#EF4444',
  c2: '#3B82F6',
  c3: '#F59E0B',
  c4: '#10B981',
  c5: '#EC4899',
  c6: '#8B5CF6',
  c7: '#06B6D4',
  c8: '#6B7280',
};

export default function SearchScreen() {
  const router = useRouter();
  const inputRef = useRef<TextInput>(null);

  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const isBrowse = !selectedCategory && query.trim() === '';
  const isCategoryView = !!selectedCategory;
  const isGlobalSearch = !selectedCategory && query.trim() !== '';

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 150);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (selectedCategory) { handleBackFromCategory(); return true; }
      return false;
    });
    return () => sub.remove();
  }, [selectedCategory]);

  useEffect(() => {
    productApi.getCategories().then(data => {
      setCategories(data.map(c => ({ id: String(c.id), name: c.name, icon: getCategoryIcon(c.name) })));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!query.trim() && !selectedCategory) {
      setProducts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(() => {
      const params: Parameters<typeof productApi.getProducts>[0] = {};
      if (query.trim()) params.searchQuery = query.trim();
      if (selectedCategory) params.categoryId = Number(selectedCategory.id);
      productApi.getProducts(params).then(data => {
        setProducts(data.map(p => ({
          id: String(p.id),
          title: p.name,
          description: '',
          price: Number(p.price),
          images: p.thumbnailUrl ? [p.thumbnailUrl] : [],
          category: { id: String(p.categoryId), name: selectedCategory?.name ?? '', icon: 'grid-outline' },
          seller: { id: '', name: '', email: '' },
          location: p.region ?? '',
          createdAt: new Date().toISOString(),
          isLiked: false,
          views: 0,
        })));
      }).catch(() => {}).finally(() => setLoading(false));
    }, 400);

    return () => clearTimeout(timer);
  }, [query, selectedCategory]);

  function handleClearQuery() {
    setQuery('');
    inputRef.current?.focus();
  }

  function handleSelectCategory(cat: Category) {
    setSelectedCategory(cat);
    setQuery('');
  }

  function handleBackFromCategory() {
    setSelectedCategory(null);
    setQuery('');
  }

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#fff' }}>

      {/* ── Search bar ── */}
      <View style={styles.searchRow}>
        {isCategoryView ? (
          <TouchableOpacity onPress={handleBackFromCategory} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={22} color={Colors.text} />
          </TouchableOpacity>
        ) : null}

        <View style={styles.inputWrap}>
          <Ionicons name="search-outline" size={18} color="#9CA3AF" />
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={query}
            onChangeText={setQuery}
            placeholder={
              selectedCategory
                ? `Search in ${selectedCategory.name}…`
                : 'Search items or people…'
            }
            placeholderTextColor="#9CA3AF"
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={handleClearQuery} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity onPress={() => router.push('/(tabs)')} activeOpacity={0.7}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>

      {/* ── Category header (when a category is selected) ── */}
      {isCategoryView && (
        <View style={styles.categoryHeader}>
          <Ionicons
            name={selectedCategory!.icon as any}
            size={18}
            color={CATEGORY_ICON_COLOR[selectedCategory!.id] ?? Colors.primary}
          />
          <Text style={styles.categoryHeaderTitle}>{selectedCategory!.name}</Text>
          <Text style={styles.categoryHeaderCount}>
            {products.length} {products.length === 1 ? 'item' : 'items'}
          </Text>
        </View>
      )}

      {/* ── Browse: category grid ── */}
      {isBrowse && (
        <FlatList
          data={categories}
          keyExtractor={c => c.id}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={styles.gridContent}
          ListHeaderComponent={<Text style={styles.browseTitle}>Browse by category</Text>}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.categoryCard, { backgroundColor: CATEGORY_BG[item.id] ?? '#F3F4F6' }]}
              onPress={() => handleSelectCategory(item)}
              activeOpacity={0.85}
            >
              <Ionicons
                name={item.icon as any}
                size={32}
                color={CATEGORY_ICON_COLOR[item.id] ?? Colors.primary}
              />
              <Text style={styles.categoryCardName}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      {/* ── Category view: product grid ── */}
      {isCategoryView && (
        <FlatList
          data={products}
          keyExtractor={p => p.id}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={styles.gridContent}
          ListEmptyComponent={
            <View style={styles.empty}>
              {loading
                ? <ActivityIndicator size="large" color="#09A5A0" />
                : <>
                    <Ionicons name="search-outline" size={40} color={Colors.border} />
                    <Text style={styles.emptyTitle}>No items found</Text>
                    <Text style={styles.emptySubtext}>Try different keywords in {selectedCategory?.name}.</Text>
                  </>
              }
            </View>
          }
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              onPress={() => router.push({ pathname: '/product/[id]', params: { id: item.id } })}
            />
          )}
        />
      )}

      {/* ── Global search: items ── */}
      {isGlobalSearch && (
        <FlatList
          data={products}
          keyExtractor={p => p.id}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={styles.gridContent}
          ListHeaderComponent={
            <Text style={styles.sectionTitle}>
              Items<Text style={styles.sectionCount}> · {products.length}</Text>
            </Text>
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              {loading
                ? <ActivityIndicator size="large" color="#09A5A0" />
                : <>
                    <Ionicons name="search-outline" size={40} color={Colors.border} />
                    <Text style={styles.emptyTitle}>No items found</Text>
                    <Text style={styles.emptySubtext}>Try different keywords or browse by category.</Text>
                  </>
              }
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.productGridItem}>
              <ProductCard
                product={item}
                onPress={() =>
                  router.push({ pathname: '/product/[id]', params: { id: item.id } })
                }
              />
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}
