import { Button } from '~/components/ui/button'
import { Text } from '~/components/ui/text'
import { Alert, View } from 'react-native'
import { Link } from 'expo-router'
import { H1 } from '~/components/ui/typography'

export default function Index() {
  return (
    <View className="flex-1 items-center justify-center gap-y-2">
      <View className="items-center">
        <H1>Welcome to NativeWind!</H1>
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
      <Link href="/login" asChild>
        <Button variant="outline">
          <Text>Go to login</Text>
        </Button>
      </Link>
      <Link href="/account" asChild>
        <Button variant="outline">
          <Text>Go to account</Text>
        </Button>
      </Link>
    </View>
  )
}
