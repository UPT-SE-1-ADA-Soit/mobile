import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  BackHandler,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProductCard } from '@/components/product-card';
import { Colors } from '@/constants/theme';
import { MOCK_CATEGORIES } from '@/mocks/categories';
import { MOCK_PRODUCTS } from '@/mocks/products';
import { MOCK_USERS } from '@/mocks/users';
import { Category } from '@/types';

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

  const isBrowse = !selectedCategory && query.trim() === '';
  const isCategoryView = !!selectedCategory;
  const isGlobalSearch = !selectedCategory && query.trim() !== '';

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 150);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (selectedCategory) {
        handleBackFromCategory();
        return true; // consumed — don't let the OS navigate away
      }
      return false; // let normal back behaviour happen
    });
    return () => sub.remove();
  }, [selectedCategory]);

  // TODO: replace with GET /api/products/search?q={query}&categoryId={selectedCategory?.id}
  const filteredProducts = MOCK_PRODUCTS.filter(p => {
    const matchesQuery =
      query.trim() === '' ||
      p.title.toLowerCase().includes(query.toLowerCase()) ||
      p.description.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = !selectedCategory || p.category.id === selectedCategory.id;
    return matchesQuery && matchesCategory;
  });

  // TODO: replace with GET /api/users/search?q={query}
  const filteredUsers = MOCK_USERS.filter(
    u =>
      query.trim() !== '' &&
      (u.name.toLowerCase().includes(query.toLowerCase()) ||
        u.location.toLowerCase().includes(query.toLowerCase()))
  );

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
            {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'}
          </Text>
        </View>
      )}

      {/* ── Browse: category grid ── */}
      {isBrowse && (
        <FlatList
          data={MOCK_CATEGORIES}
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
          data={filteredProducts}
          keyExtractor={p => p.id}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={styles.gridContent}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="search-outline" size={40} color={Colors.border} />
              <Text style={styles.emptyTitle}>No items found</Text>
              <Text style={styles.emptySubtext}>
                Try different keywords in {selectedCategory?.name}.
              </Text>
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

      {/* ── Global search: items + people ── */}
      {isGlobalSearch && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.globalContent}
        >
          {/* People */}
          {filteredUsers.length > 0 && (
            <View>
              <Text style={styles.sectionTitle}>People</Text>
              {filteredUsers.map(u => (
                <TouchableOpacity
                  key={u.id}
                  style={styles.userRow}
                  activeOpacity={0.75}
                  onPress={() => {
                    // TODO: navigate to seller profile — GET /api/users/{u.id}
                  }}
                >
                  <Image source={{ uri: u.avatar }} style={styles.userAvatar} contentFit="cover" />
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{u.name}</Text>
                    <View style={styles.userMeta}>
                      <Ionicons name="location-outline" size={12} color={Colors.textSecondary} />
                      <Text style={styles.userMetaText}>{u.location}</Text>
                      <Ionicons name="star" size={12} color="#F59E0B" />
                      <Text style={styles.userMetaText}>{u.rating}</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={Colors.border} />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Items */}
          <Text style={styles.sectionTitle}>
            Items
            <Text style={styles.sectionCount}> · {filteredProducts.length}</Text>
          </Text>

          {filteredProducts.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="search-outline" size={40} color={Colors.border} />
              <Text style={styles.emptyTitle}>No items found</Text>
              <Text style={styles.emptySubtext}>Try different keywords or browse by category.</Text>
            </View>
          ) : (
            <View style={styles.productsGrid}>
              {filteredProducts.map((item, i) => (
                <View key={item.id} style={styles.productGridItem}>
                  <ProductCard
                    product={item}
                    onPress={() =>
                      router.push({ pathname: '/product/[id]', params: { id: item.id } })
                    }
                  />
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    padding: 2,
  },
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.secondary,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    padding: 0,
  },
  cancelText: {
    fontSize: 15,
    color: Colors.primary,
    fontWeight: '600',
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  categoryHeaderTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  categoryHeaderCount: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  browseTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  gridRow: {
    gap: 12,
    paddingHorizontal: 16,
  },
  gridContent: {
    paddingBottom: 32,
  },
  categoryCard: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 22,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 12,
  },
  categoryCardName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
  },
  globalContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 10,
  },
  sectionCount: {
    fontWeight: '400',
    color: Colors.textSecondary,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  userInfo: {
    flex: 1,
    gap: 4,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  userMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  userMetaText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginRight: 6,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  productGridItem: {
    width: '47.5%',
  },
  empty: {
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 32,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
