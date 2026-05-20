import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SellScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <View className="flex-1 items-center justify-center">
        <Text className="text-gray-400 text-base">List an item — coming soon</Text>
      </View>
    </SafeAreaView>
  );
}
