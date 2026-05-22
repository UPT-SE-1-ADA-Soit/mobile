import { Text, TouchableOpacity } from 'react-native';

import { Category } from '@/types';
import { styles } from './category-pill-styles';

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
