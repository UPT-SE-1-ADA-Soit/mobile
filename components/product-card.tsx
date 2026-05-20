import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Colors } from '@/constants/theme';
import { Product } from '@/types';

type Props = {
  product: Product;
  onPress: () => void;
};

export function ProductCard({ product, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.9}>
      <Image
        source={{ uri: product.images[0] }}
        style={styles.image}
        contentFit="cover"
      />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {product.title}
        </Text>
        <View style={styles.footer}>
          <Text style={styles.price}>${product.price}</Text>
          <Ionicons
            name={product.isLiked ? 'heart' : 'heart-outline'}
            size={18}
            color={product.isLiked ? Colors.accent : '#D1D5DB'}
          />
        </View>
        <Text style={styles.location} numberOfLines={1}>
          {product.location}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  image: {
    width: '100%',
    aspectRatio: 1,
  },
  info: {
    padding: 8,
  },
  title: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.text,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  price: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  location: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 4,
  },
});
