import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { MOCK_CONVERSATIONS } from '@/mocks/messages';
import { MOCK_PRODUCTS } from '@/mocks/products';
import { MOCK_USERS } from '@/mocks/users';
import { Message } from '@/types';

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function ChatScreen() {
  const { id, productId, sellerId } = useLocalSearchParams<{
    id: string;
    productId?: string;
    sellerId?: string;
  }>();
  const router = useRouter();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);
  const [input, setInput] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const show = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      e => setKeyboardHeight(e.endCoordinates.height)
    );
    const hide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardHeight(0)
    );
    return () => { show.remove(); hide.remove(); };
  }, []);

  // TODO: replace with GET /api/conversations/{id} (or POST to create new)
  const existingConv = MOCK_CONVERSATIONS.find(c => c.id === id);

  const product =
    existingConv?.product ?? MOCK_PRODUCTS.find(p => p.id === productId);

  const otherUser = existingConv
    ? existingConv.buyer.id === user?.id
      ? existingConv.seller
      : existingConv.buyer
    : MOCK_USERS.find(u => u.id === sellerId);

  const [messages, setMessages] = useState<Message[]>(existingConv?.messages ?? []);

  function handleSend() {
    const text = input.trim();
    if (!text || !user) return;

    // TODO: replace with POST /api/conversations/{id}/messages
    const newMsg: Message = {
      id: `msg_${Date.now()}`,
      senderId: user.id,
      text,
      createdAt: new Date().toISOString(),
      read: true,
    };
    setMessages(prev => [...prev, newMsg]);
    setInput('');
  }

  if (!product || !otherUser) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Conversation not found.</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backLink}>← Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top']}>
      <View style={{ flex: 1, paddingBottom: keyboardHeight > 0 ? keyboardHeight + insets.bottom : 0 }}>
        {/* ── Header ── */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>

          <Image
            source={{ uri: otherUser.avatar }}
            style={styles.headerAvatar}
            contentFit="cover"
          />

          <View style={styles.headerInfo}>
            <Text style={styles.headerName} numberOfLines={1}>{otherUser.name}</Text>
            <Text style={styles.headerProduct} numberOfLines={1}>
              {product.title} · ${product.price}
            </Text>
          </View>

          <Image
            source={{ uri: product.images[0] }}
            style={styles.headerThumbnail}
            contentFit="cover"
          />
        </View>

        {/* ── Messages ── */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={m => m.id}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
          ListEmptyComponent={
            <View style={styles.emptyChat}>
              <Text style={styles.emptyChatText}>
                Say hello! Ask about the {product.title}.
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const isSent = item.senderId === user?.id;
            return (
              <View style={[styles.bubbleRow, isSent && styles.bubbleRowSent]}>
                <View style={[styles.bubble, isSent ? styles.bubbleSent : styles.bubbleReceived]}>
                  <Text style={[styles.bubbleText, isSent && styles.bubbleTextSent]}>
                    {item.text}
                  </Text>
                  <Text style={[styles.bubbleTime, isSent && styles.bubbleTimeSent]}>
                    {formatTime(item.createdAt)}
                  </Text>
                </View>
              </View>
            );
          }}
        />

        {/* ── Input bar ── */}
        <View style={[styles.inputWrapper, { paddingBottom: keyboardHeight > 0 ? 4 : Math.max(insets.bottom, 8) }]}>
          <View style={styles.inputBar}>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder="Type a message..."
              placeholderTextColor="#9CA3AF"
              multiline
              maxLength={500}
              returnKeyType="send"
              onSubmitEditing={handleSend}
            />
            <TouchableOpacity
              style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
              onPress={handleSend}
              disabled={!input.trim()}
              activeOpacity={0.8}
            >
              <Ionicons name="send" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    gap: 12,
  },
  notFoundText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  backLink: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  headerProduct: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  headerThumbnail: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  messageList: {
    padding: 16,
    gap: 8,
    flexGrow: 1,
  },
  emptyChat: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyChatText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  bubbleRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  bubbleRowSent: {
    justifyContent: 'flex-end',
  },
  bubble: {
    maxWidth: '75%',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 9,
    gap: 3,
  },
  bubbleSent: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleReceived: {
    backgroundColor: '#F3F4F6',
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  bubbleTextSent: {
    color: '#fff',
  },
  bubbleTime: {
    fontSize: 10,
    color: Colors.textSecondary,
    alignSelf: 'flex-end',
  },
  bubbleTimeSent: {
    color: 'rgba(255,255,255,0.7)',
  },
  inputWrapper: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: '#fff',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: Colors.text,
    backgroundColor: Colors.secondary,
    maxHeight: 120,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  sendBtnDisabled: {
    backgroundColor: '#D1D5DB',
  },
});
