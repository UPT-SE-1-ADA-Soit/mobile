import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ConditionBadge } from '@/components/condition-badge';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { useLikes } from '@/context/likes';
import { MOCK_CONVERSATIONS } from '@/mocks/messages';
import { MOCK_PRODUCTS } from '@/mocks/products';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_HEIGHT = SCREEN_WIDTH * 0.88;

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  // TODO: replace with GET /api/products/{id}
  const product = MOCK_PRODUCTS.find(p => p.id === id);

  const { isLiked, toggleLike } = useLikes();
  const liked = product ? isLiked(product.id) : false;

  const [activeImage, setActiveImage] = useState(0);

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

  return (
    <View style={styles.screen}>
      {/* ── Image carousel ── */}
      <View style={{ height: IMAGE_HEIGHT }}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={e => {
            const index = Math.round(
              e.nativeEvent.contentOffset.x / SCREEN_WIDTH
            );
            setActiveImage(index);
          }}
        >
          {product.images.map((uri, i) => (
            <Image
              key={i}
              source={{ uri }}
              style={{ width: SCREEN_WIDTH, height: IMAGE_HEIGHT }}
              contentFit="cover"
            />
          ))}
        </ScrollView>

        {/* Back button */}
        <TouchableOpacity
          style={[styles.floatBtn, styles.backBtn, { top: insets.top + 8 }]}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>

        {/* Like button */}
        <TouchableOpacity
          style={[styles.floatBtn, styles.likeBtn, { top: insets.top + 8 }]}
          onPress={() => toggleLike(product.id)}
          activeOpacity={0.8}
        >
          <Ionicons
            name={liked ? 'heart' : 'heart-outline'}
            size={20}
            color={liked ? Colors.accent : '#fff'}
          />
        </TouchableOpacity>

        {/* Pagination dots */}
        {product.images.length > 1 && (
          <View style={styles.dots}>
            {product.images.map((_, i) => (
              <View
                key={i}
                style={[styles.dot, i === activeImage && styles.dotActive]}
              />
            ))}
          </View>
        )}
      </View>

      {/* ── Scrollable content ── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Price + Condition */}
        <View style={styles.priceRow}>
          <Text style={styles.price}>${product.price}</Text>
          <ConditionBadge condition={product.condition} />
        </View>

        {/* Title */}
        <Text style={styles.title}>{product.title}</Text>

        {/* Location + Views */}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.metaText}>{product.location}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="eye-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.metaText}>{product.views} views</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Description */}
        <Text style={styles.sectionLabel}>Description</Text>
        <Text style={styles.description}>{product.description}</Text>

        <View style={styles.divider} />

        {/* Seller */}
        <Text style={styles.sectionLabel}>Seller</Text>
        <View style={styles.sellerRow}>
          <Image
            source={{ uri: product.seller.avatar }}
            style={styles.sellerAvatar}
            contentFit="cover"
          />
          <View style={styles.sellerInfo}>
            <Text style={styles.sellerName}>{product.seller.name}</Text>
            <View style={styles.sellerMeta}>
              <Ionicons name="star" size={13} color="#F59E0B" />
              <Text style={styles.sellerMetaText}>
                {product.seller.rating} · {product.seller.totalSales} sales
              </Text>
            </View>
            <Text style={styles.sellerLocation}>{product.seller.location}</Text>
          </View>
        </View>
      </ScrollView>

      {/* ── Bottom action bar ── */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity
          style={styles.messageBtn}
          activeOpacity={0.8}
          onPress={() => {
            if (!user) { router.push('/(auth)/login'); return; }
            // TODO: replace with real API call to get/create conversation
            const existing = MOCK_CONVERSATIONS.find(
              c => c.product.id === product.id
            );
            router.push({
              pathname: '/chat/[id]',
              params: {
                id: existing?.id ?? 'new',
                productId: product.id,
                sellerId: product.seller.id,
              },
            });
          }}
        >
          <Ionicons name="chatbubble-outline" size={17} color={Colors.primary} />
          <Text style={styles.messageBtnText}>Message</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.buyBtn}
          activeOpacity={0.8}
          onPress={() => {
            if (!user) { router.push('/(auth)/login'); return; }
            // TODO: implement purchase flow
          }}
        >
          <Text style={styles.buyBtnText}>Buy · ${product.price}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fff',
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    gap: 12,
  },
  notFoundText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  backLink: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  floatBtn: {
    position: 'absolute',
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtn: {
    left: 16,
  },
  likeBtn: {
    right: 16,
  },
  dots: {
    position: 'absolute',
    bottom: 12,
    flexDirection: 'row',
    alignSelf: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  dotActive: {
    backgroundColor: '#fff',
    width: 18,
    borderRadius: 3,
  },
  content: {
    padding: 16,
    paddingBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  price: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    lineHeight: 26,
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 16,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
  },
  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sellerAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  sellerInfo: {
    flex: 1,
    gap: 3,
  },
  sellerName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  sellerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sellerMetaText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  sellerLocation: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  bottomBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: '#fff',
  },
  messageBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  messageBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.primary,
  },
  buyBtn: {
    flex: 1.4,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: Colors.primary,
  },
  buyBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
});
