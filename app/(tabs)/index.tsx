import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-4xl font-bold text-teal-500">Marketplace</Text>
        <Text className="text-base text-gray-400 mt-2 text-center">
          Your local buy & sell community
        </Text>
      </View>
    </SafeAreaView>
  );
}
