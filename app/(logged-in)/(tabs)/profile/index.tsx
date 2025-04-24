import { Link } from 'expo-router'
import { ScrollView, View } from 'react-native'
import { useAuth } from '~/providers/AuthProvider'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { Button } from '~/components/ui/button'
import { Text } from '~/components/ui/text'
import { H1, Large } from '~/components/ui/typography'

export default function ProfileIndex() {
  const { profile } = useAuth()
  const { username, full_name, avatar_url } = profile

  return (
    <ScrollView className="pt-safe-offset-6 flex-1 p-6" contentContainerClassName="gap-6">
      <View className="flex-1 flex-row items-end justify-between">
        <Avatar
          alt={avatar_url ? 'Your profile image' : 'Add your profile image'}
          className="size-32 rounded-full"
        >
          {avatar_url ? (
            <AvatarImage
              bucketId="avatars"
              path={avatar_url}
              accessibilityLabel="Your profile image"
            />
          ) : (
            <AvatarFallback />
          )}
        </Avatar>
        <View>
          <Link href="/profile/edit" asChild>
            <Button variant="secondary" className="rounded-full">
              <Text>Edit profile</Text>
            </Button>
          </Link>
        </View>
      </View>
      <View className="flex-1 justify-center gap-2">
        <H1>{username}</H1>
        <Large>{full_name}</Large>
      </View>
    </ScrollView>
  )
}
