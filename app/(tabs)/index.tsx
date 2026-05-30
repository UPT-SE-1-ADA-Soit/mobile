import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CategoryPill } from '@/components/category-pill';
import { ProductCard } from '@/components/product-card';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { getCategoryIcon, productApi } from '@/services/api';
import { Category, Product } from '@/types';
import { styles } from './index-styles';

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productApi.getCategories()
      .then(data => setCategories(data.map(c => ({ id: String(c.id), name: c.name, icon: getCategoryIcon(c.name) }))))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const noFilters = !selectedCategory;
    const params = user && noFilters
      ? { recommendForUserId: Number(user.id) }
      : { categoryId: selectedCategory ? Number(selectedCategory) : undefined };

    productApi.getProducts(params).then(data => {
      setAllProducts(data.map(p => ({
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
  }, [user?.id, selectedCategory]);

  function handleCategoryPress(id: string) {
    setSelectedCategory(prev => (prev === id ? null : id));
  }

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <FlatList
        data={allProducts}
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
              data={categories}
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
            {loading
              ? <ActivityIndicator size="large" color="#09A5A0" />
              : <Text style={styles.emptyText}>No items in this category yet.</Text>
            }
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
