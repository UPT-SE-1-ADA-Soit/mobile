import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MessagesScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <View className="flex-1 items-center justify-center">
        <Text className="text-gray-400 text-base">Messages — coming soon</Text>
      </View>
    </SafeAreaView>
  );
}
