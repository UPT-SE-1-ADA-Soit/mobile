import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';

export const styles = StyleSheet.create({
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
