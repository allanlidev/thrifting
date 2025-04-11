import { Button } from '~/components/ui/button'
import { Text } from '~/components/ui/text'
import { Alert, View } from 'react-native'

export default function Index() {
  return (
    <View className="flex-1 items-center justify-center gap-y-2">
      <View className="items-center">
        <Text className="text-4xl">Welcome to NativeWind!</Text>
        <Text className="text-xl">Style your app with</Text>
        <Text className="bg-blue-500 text-3xl font-bold underline">Tailwind CSS!</Text>
      </View>
      <Button
        onPress={() => {
          Alert.alert('NativeWind', "You're all set up!")
        }}
      >
        <Text>Sounds good!</Text>
      </Button>
    </View>
  )
}
