import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    gap: 12,
  },
  thumbnail: {
    width: 58,
    height: 58,
    borderRadius: 10,
    flexShrink: 0,
  },
  content: {
    flex: 1,
    gap: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    flex: 1,
    marginRight: 8,
  },
  nameBold: {
    fontWeight: '700',
  },
  time: {
    fontSize: 12,
    color: Colors.textSecondary,
    flexShrink: 0,
  },
  productTitle: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  lastMessage: {
    flex: 1,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  lastMessageBold: {
    fontWeight: '600',
    color: Colors.text,
  },
  badge: {
    backgroundColor: Colors.primary,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
});
