import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { styles } from './messages-styles';

export default function MessagesScreen() {
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
      </View>

      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 }}>
        <Ionicons name="chatbubble-ellipses-outline" size={56} color={Colors.border} />
        <Text style={{ fontSize: 18, fontWeight: '600', color: Colors.text, marginTop: 16 }}>
          Coming soon
        </Text>
        <Text style={{ fontSize: 14, color: Colors.textSecondary, marginTop: 8, textAlign: 'center' }}>
          Messaging between buyers and sellers will be available in a future update.
        </Text>
      </View>
    </SafeAreaView>
  );
}
