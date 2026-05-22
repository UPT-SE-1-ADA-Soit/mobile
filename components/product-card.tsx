import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';

import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { useLikes } from '@/context/likes';
import { Product } from '@/types';
import { styles } from './product-card-styles';

type Props = {
  product: Product;
  onPress: () => void;
};

export function ProductCard({ product, onPress }: Props) {
  const { user } = useAuth();
  const { isLiked, toggleLike } = useLikes();
  const router = useRouter();
  const liked = user ? isLiked(product.id) : false;

  function handleHeartPress() {
    if (!user) { router.push('/(auth)/login'); return; }
    toggleLike(product.id);
  }

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.imageWrap}>
        <Image
          source={{ uri: product.images[0] }}
          style={styles.image}
          contentFit="cover"
        />
        <TouchableOpacity
          style={styles.heartBtn}
          onPress={handleHeartPress}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Ionicons
            name={liked ? 'heart' : 'heart-outline'}
            size={18}
            color={liked ? Colors.accent : '#fff'}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {product.title}
        </Text>
        <Text style={styles.price}>${product.price}</Text>
        <Text style={styles.location} numberOfLines={1}>
          {product.location}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
