import { Ionicons } from '@expo/vector-icons';
import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CategoryPill } from '@/components/category-pill';
import { ProductCard } from '@/components/product-card';
import { useAuth } from '@/context/auth';
import { MOCK_CATEGORIES } from '@/mocks/categories';
import { MOCK_PRODUCTS } from '@/mocks/products';
import { styles } from './landing-styles';

export default function LandingScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  if (user) return <Redirect href="/(tabs)" />;

  // TODO: replace with GET /api/products/recent
  const products = MOCK_PRODUCTS.filter(p => {
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
              data={MOCK_CATEGORIES}
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
            <Text style={styles.emptyText}>No items found.</Text>
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
