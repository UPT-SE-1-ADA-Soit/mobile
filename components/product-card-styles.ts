import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  imageWrap: {
    width: '100%',
    aspectRatio: 1,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  heartBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    padding: 8,
    gap: 3,
  },
  title: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.text,
    lineHeight: 18,
  },
  price: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  location: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
});
