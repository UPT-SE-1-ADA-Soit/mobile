import { useRouter } from 'expo-router';
import { FlatList, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ConversationCard } from '@/components/conversation-card';
import { useAuth } from '@/context/auth';
import { MOCK_CONVERSATIONS } from '@/mocks/messages';
import { styles } from './messages-styles';

export default function MessagesScreen() {
  const { user } = useAuth();
  const router = useRouter();

  // TODO: replace with GET /api/conversations?userId={user.id}
  const conversations = MOCK_CONVERSATIONS;

  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        {totalUnread > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{totalUnread}</Text>
          </View>
        )}
      </View>

      {/* Conversation list */}
      <FlatList
        data={conversations}
        keyExtractor={c => c.id}
        renderItem={({ item }) => (
          <ConversationCard
            conversation={item}
            currentUserId={user?.id ?? ''}
            onPress={() =>
              router.push({ pathname: '/chat/[id]', params: { id: item.id } })
            }
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No messages yet.</Text>
            <Text style={styles.emptySubtext}>
              Start a conversation by tapping Message on any product.
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}
