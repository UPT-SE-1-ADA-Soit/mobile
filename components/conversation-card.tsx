import { Image } from 'expo-image';
import { Text, TouchableOpacity, View } from 'react-native';

import { Conversation } from '@/types';
import { styles } from './conversation-card-styles';

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
