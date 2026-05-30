import { Ionicons } from '@expo/vector-icons';
import { Redirect, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CategoryPill } from '@/components/category-pill';
import { ProductCard } from '@/components/product-card';
import { useAuth } from '@/context/auth';
import { getCategoryIcon, productApi } from '@/services/api';
import { Category, Product } from '@/types';
import { styles } from './landing-styles';

export default function LandingScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      productApi.getCategories(),
      productApi.getProducts(),
    ]).then(([cats, prods]) => {
      setCategories(cats.map(c => ({ id: String(c.id), name: c.name, icon: getCategoryIcon(c.name) })));
      setAllProducts(prods.map(p => ({
        id: String(p.id),
        title: p.name,
        description: '',
        price: Number(p.price),
        images: p.thumbnailUrl ? [p.thumbnailUrl] : [],
        category: { id: String(p.categoryId), name: '', icon: 'grid-outline' },
        seller: { id: '', name: '', email: '' },
        location: p.region ?? '',
        createdAt: new Date().toISOString(),
        isLiked: false,
        views: 0,
      })));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (user) return <Redirect href="/(tabs)" />;

  const products = allProducts.filter(p => {
    const matchesQuery =
      query.trim() === '' ||
      p.title.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = !selectedCategory || p.category.id === selectedCategory;
    return matchesQuery && matchesCategory;
  });

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#fff' }}>
      <FlatList
        data={products}
        keyExtractor={p => p.id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View>
            {/* ── Top bar ── */}
            <View style={styles.topBar}>
              <View style={styles.brand}>
                <View style={styles.brandIcon}>
                  <Text style={styles.brandIconText}>M</Text>
                </View>
                <Text style={styles.brandName}>Marketa</Text>
              </View>
              <View style={styles.authButtons}>
                <TouchableOpacity
                  style={styles.loginBtn}
                  onPress={() => router.push('/(auth)/login')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.loginBtnText}>Log in</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.signupBtn}
                  onPress={() => router.push('/(auth)/register')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.signupBtnText}>Sign up</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* ── Search bar ── */}
            <View style={styles.searchBar}>
              <Ionicons name="search-outline" size={18} color="#9CA3AF" />
              <TextInput
                style={styles.searchInput}
                value={query}
                onChangeText={setQuery}
                placeholder="Search for items..."
                placeholderTextColor="#9CA3AF"
                returnKeyType="search"
                autoCorrect={false}
                autoCapitalize="none"
              />
              {query.length > 0 && (
                <TouchableOpacity onPress={() => setQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name="close-circle" size={18} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            </View>

            {/* ── Category pills ── */}
            <FlatList
              data={categories}
              keyExtractor={c => c.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryList}
              renderItem={({ item }) => (
                <CategoryPill
                  category={item}
                  selected={selectedCategory === item.id}
                  onPress={() => setSelectedCategory(prev => prev === item.id ? null : item.id)}
                />
              )}
            />

            <Text style={styles.sectionTitle}>
              {query.trim() || selectedCategory ? `${products.length} results` : 'Recent listings'}
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            {loading
              ? <ActivityIndicator size="large" color="#09A5A0" />
              : <Text style={styles.emptyText}>No items found.</Text>
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
    </SafeAreaView>
  );
}
