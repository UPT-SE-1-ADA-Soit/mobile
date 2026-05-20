import { StyleSheet, Text, TouchableOpacity } from 'react-native';

import { Colors } from '@/constants/theme';
import { Category } from '@/types';

type Props = {
  category: Category;
  selected: boolean;
  onPress: () => void;
};

export function CategoryPill({ category, selected, onPress }: Props) {
  return (
    <TouchableOpacity
      style={[styles.pill, selected && styles.pillSelected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.text, selected && styles.textSelected]}>
        {category.name}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  pillSelected: {
    backgroundColor: Colors.primary,
  },
  text: {
    fontSize: 13,
    fontWeight: '500',
    color: '#4B5563',
  },
  textSelected: {
    color: '#ffffff',
  },
});
