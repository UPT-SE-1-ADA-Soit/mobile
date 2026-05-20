import { StyleSheet, Text, View } from 'react-native';

import { ProductCondition } from '@/types';

const config: Record<ProductCondition, { label: string; color: string; bg: string }> = {
  'new':       { label: 'New',      color: '#059669', bg: '#D1FAE5' },
  'like-new':  { label: 'Like New', color: '#09A5A0', bg: '#CCFBF1' },
  'good':      { label: 'Good',     color: '#2563EB', bg: '#DBEAFE' },
  'fair':      { label: 'Fair',     color: '#D97706', bg: '#FEF3C7' },
};

export function ConditionBadge({ condition }: { condition: ProductCondition }) {
  const { label, color, bg } = config[condition];
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});
