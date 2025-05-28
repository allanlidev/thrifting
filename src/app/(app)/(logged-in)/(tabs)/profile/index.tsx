import { Link } from 'expo-router'
import { ScrollView, View } from 'react-native'
import { useAuth } from '~/src/providers/AuthProvider'
import { Avatar, AvatarFallback, AvatarImage } from '~/src/components/ui/avatar'
import { Button } from '~/src/components/ui/button'
import { Text } from '~/src/components/ui/text'
import { H1, Large } from '~/src/components/ui/typography'
import { Trans } from '@lingui/react/macro'
import { Settings } from '~/src/components/icons/Settings'
import { ButtonGroup } from '~/src/components/ButtonGroup'
import { ChevronRight } from '~/src/components/icons/ChevronRight'

export default function ProfileIndex() {
  const { profile } = useAuth()

  const avatarUrl = profile?.avatar_url
  const username = profile?.username
  const fullName = profile?.full_name

  return (
    <ScrollView className="pt-safe-offset-6 flex-1 p-6" contentContainerClassName="gap-6">
      <View className="relative h-52 flex-1 flex-row items-end justify-between">
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

        <Link href="/profile/edit" asChild>
          <Button variant="secondary" className="rounded-full">
            <Text>
              <Trans>Edit profile</Trans>
            </Text>
          </Button>
        </Link>

        <Link href="/profile/settings" asChild>
          <Button
            variant="secondary"
            size="icon"
            className="absolute right-0 top-0 h-11 w-11 rounded-full"
          >
            <Settings className="color-foreground" />
          </Button>
        </Link>
      </View>
      <View className="flex-1 justify-center gap-2">
        <H1>{username}</H1>
        <Large>{fullName}</Large>
      </View>
      <ButtonGroup>
        <Link href="/profile/listings" asChild>
          <Button variant="outline" size="lg" className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <Text>
                <Trans>My listings</Trans>
              </Text>
            </View>
            <ChevronRight className="color-foreground" />
          </Button>
        </Link>
      </ButtonGroup>
    </ScrollView>
  )
}
