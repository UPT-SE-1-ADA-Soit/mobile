import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { useLikes } from '@/context/likes';
import { authApi, productApi } from '@/services/api';
import { ApiProductDetail, ApiUserProfile } from '@/types/api';
import { styles } from './[id]-styles';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_HEIGHT = SCREEN_WIDTH * 0.88;

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [product, setProduct] = useState<ApiProductDetail | null>(null);
  const [seller, setSeller] = useState<ApiUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  const { isLiked, toggleLike } = useLikes();
  const liked = product ? isLiked(String(product.id)) : false;

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    productApi.getProductById(Number(id))
      .then(async data => {
        setProduct(data);
        if (user) {
          productApi.addToHistory(Number(user.id), data.id).catch(() => {});
        }
        if (data.sellerId) {
          authApi.getUserById(data.sellerId).then(setSeller).catch(() => {});
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id, user?.id]);

  async function handleBuy() {
    if (!user) { router.push('/(auth)/login'); return; }
    if (!product) return;
    setBuying(true);
    try {
      await productApi.createOrder(product.id);
      Alert.alert('Order placed!', `You bought ${product.name}.`, [
        { text: 'View Orders', onPress: () => router.push('/(tabs)/profile') },
        { text: 'OK' },
      ]);
      setProduct(prev => prev ? { ...prev, inStock: false } : prev);
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Could not place order.');
    } finally {
      setBuying(false);
    }
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Product not found.</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backLink}>← Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const images = product.imageUrls ?? [];

  return (
    <View style={styles.screen}>
      {/* ── Image carousel ── */}
      <View style={{ height: IMAGE_HEIGHT }}>
        {images.length > 0 ? (
          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={e => setActiveImage(Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH))}>
            {images.map((uri, i) => (
              <Image key={i} source={{ uri }} style={{ width: SCREEN_WIDTH, height: IMAGE_HEIGHT }} contentFit="cover" />
            ))}
          </ScrollView>
        ) : (
          <View style={{ width: SCREEN_WIDTH, height: IMAGE_HEIGHT, backgroundColor: Colors.border,
            justifyContent: 'center', alignItems: 'center' }}>
            <Ionicons name="image-outline" size={64} color={Colors.textSecondary} />
          </View>
        )}

        <TouchableOpacity style={[styles.floatBtn, styles.backBtn, { top: insets.top + 8 }]}
          onPress={() => router.back()} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>

        {user && (
          <TouchableOpacity style={[styles.floatBtn, styles.likeBtn, { top: insets.top + 8 }]}
            onPress={() => toggleLike(String(product.id))} activeOpacity={0.8}>
            <Ionicons name={liked ? 'heart' : 'heart-outline'} size={20} color={liked ? Colors.accent : '#fff'} />
          </TouchableOpacity>
        )}

        {images.length > 1 && (
          <View style={styles.dots}>
            {images.map((_, i) => (
              <View key={i} style={[styles.dot, i === activeImage && styles.dotActive]} />
            ))}
          </View>
        )}
      </View>

      {/* ── Scrollable content ── */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.priceRow}>
          <Text style={styles.price}>${product.price}</Text>
          {!product.inStock && (
            <View style={{ paddingHorizontal: 10, paddingVertical: 4, backgroundColor: '#FEE2E2', borderRadius: 6 }}>
              <Text style={{ color: '#EF4444', fontSize: 12, fontWeight: '600' }}>Sold</Text>
            </View>
          )}
        </View>

        <Text style={styles.title}>{product.name}</Text>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.metaText}>{product.region}</Text>
          </View>
        </View>

        {product.description ? (
          <>
            <View style={styles.divider} />
            <Text style={styles.sectionLabel}>Description</Text>
            <Text style={styles.description}>{product.description}</Text>
          </>
        ) : null}

        {seller && (
          <>
            <View style={styles.divider} />
            <Text style={styles.sectionLabel}>Seller</Text>
            <View style={styles.sellerRow}>
              {seller.avatarUrl ? (
                <Image source={{ uri: seller.avatarUrl }} style={styles.sellerAvatar} contentFit="cover" />
              ) : (
                <View style={[styles.sellerAvatar, { backgroundColor: Colors.border, justifyContent: 'center', alignItems: 'center' }]}>
                  <Ionicons name="person-outline" size={24} color={Colors.textSecondary} />
                </View>
              )}
              <View style={styles.sellerInfo}>
                <Text style={styles.sellerName}>{seller.name}</Text>
                {seller.location ? <Text style={styles.sellerLocation}>{seller.location}</Text> : null}
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {/* ── Bottom action bar ── */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity style={[styles.messageBtn, { opacity: 0.4 }]} activeOpacity={1}
          onPress={() => Alert.alert('Coming soon', 'Messaging will be available in a future update.')}>
          <Ionicons name="chatbubble-outline" size={17} color={Colors.primary} />
          <Text style={styles.messageBtnText}>Message</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.buyBtn, (!product.inStock || buying) && { opacity: 0.5 }]}
          activeOpacity={0.8}
          disabled={!product.inStock || buying}
          onPress={handleBuy}
        >
          {buying
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.buyBtnText}>{product.inStock ? `Buy · $${product.price}` : 'Sold Out'}</Text>
          }
        </TouchableOpacity>
      </View>
    </View>
  );
}
