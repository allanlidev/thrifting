import { Link } from 'expo-router'
import { ScrollView, View } from 'react-native'
import { useAuth } from '~/providers/AuthProvider'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { Button } from '~/components/ui/button'
import { Text } from '~/components/ui/text'
import { H1, Large } from '~/components/ui/typography'
import { Trans } from '@lingui/react/macro'

export default function ProfileIndex() {
  const { profile } = useAuth()

  const avatarUrl = profile?.avatar_url
  const username = profile?.username
  const fullName = profile?.full_name

  return (
    <ScrollView className="pt-safe-offset-6 flex-1 p-6" contentContainerClassName="gap-6">
      <View className="flex-1 flex-row items-end justify-between">
        <Avatar
          alt={avatarUrl ? 'Your profile image' : 'Add your profile image'}
          className="size-32 rounded-full"
        >
          {avatarUrl ? (
            <AvatarImage
              bucketId="avatars"
              path={avatarUrl}
              accessibilityLabel="Your profile image"
            />
          ) : (
            <AvatarFallback />
          )}
        </Avatar>
        <View>
          <Link href="/profile/edit" asChild>
            <Button variant="secondary" className="rounded-full">
              <Text>
                <Trans>Edit profile</Trans>
              </Text>
            </Button>
          </Link>
        </View>
      </View>
      <View className="flex-1 justify-center gap-2">
        <H1>{username}</H1>
        <Large>{fullName}</Large>
      </View>
    </ScrollView>
  )
}
