import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CategoryPill } from '@/components/category-pill';
import { ProductCard } from '@/components/product-card';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { MOCK_CATEGORIES } from '@/mocks/categories';
import { MOCK_PRODUCTS } from '@/mocks/products';

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // TODO: replace with GET /api/products/recommended?userId={user.id}
  const products = selectedCategory
    ? MOCK_PRODUCTS.filter(p => p.category.id === selectedCategory)
    : MOCK_PRODUCTS;

  function handleCategoryPress(id: string) {
    setSelectedCategory(prev => (prev === id ? null : id));
  }

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <FlatList
        data={products}
        keyExtractor={p => p.id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View>
            {/* Top bar */}
            <View style={styles.topBar}>
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={15} color={Colors.textSecondary} />
                <Text style={styles.locationText}>{user?.location ?? 'Nearby'}</Text>
              </View>
              <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
                <Image
                  source={{ uri: user?.avatar }}
                  style={styles.avatar}
                  contentFit="cover"
                />
              </TouchableOpacity>
            </View>

            {/* Search bar — tapping navigates to search tab */}
            <TouchableOpacity
              style={styles.searchBar}
              onPress={() => router.push('/(tabs)/search')}
              activeOpacity={0.8}
            >
              <Ionicons name="search-outline" size={18} color="#9CA3AF" />
              <Text style={styles.searchPlaceholder}>Search for items...</Text>
            </TouchableOpacity>

            {/* Category filter */}
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
                  onPress={() => handleCategoryPress(item.id)}
                />
              )}
            />

            {/* Section title */}
            <Text style={styles.sectionTitle}>
              {selectedCategory ? 'Filtered results' : 'Recommended for you'}
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No items in this category yet.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={() =>
              router.push({ pathname: '/product/[id]', params: { id: item.id } })
            }
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.secondary,
    marginHorizontal: 16,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 15,
    color: '#9CA3AF',
  },
  categoryList: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  row: {
    gap: 12,
    paddingHorizontal: 16,
  },
  listContent: {
    paddingBottom: 32,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 40,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});
