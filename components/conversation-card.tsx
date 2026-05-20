import { Image } from 'expo-image';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Colors } from '@/constants/theme';
import { Conversation } from '@/types';

type Props = {
  conversation: Conversation;
  currentUserId: string;
  onPress: () => void;
};

function formatTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86_400_000);
  if (diffDays === 0) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (diffDays < 7)   return date.toLocaleDateString([], { weekday: 'short' });
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export function ConversationCard({ conversation, currentUserId, onPress }: Props) {
  const otherUser =
    conversation.buyer.id === currentUserId ? conversation.seller : conversation.buyer;
  const isUnread = conversation.unreadCount > 0;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <Image
        source={{ uri: conversation.product.images[0] }}
        style={styles.thumbnail}
        contentFit="cover"
      />

      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={[styles.name, isUnread && styles.nameBold]} numberOfLines={1}>
            {otherUser.name}
          </Text>
          <Text style={styles.time}>
            {formatTime(conversation.lastMessage.createdAt)}
          </Text>
        </View>

        <Text style={styles.productTitle} numberOfLines={1}>
          {conversation.product.title}
        </Text>

        <View style={styles.bottomRow}>
          <Text
            style={[styles.lastMessage, isUnread && styles.lastMessageBold]}
            numberOfLines={1}
          >
            {conversation.lastMessage.text}
          </Text>
          {isUnread && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{conversation.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
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
