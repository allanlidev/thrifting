import { Link } from 'expo-router'
import { ScrollView, View } from 'react-native'
import { Button } from '~/src/components/ui/button'
import { H1 } from '~/src/components/ui/typography'
import { Text } from '~/src/components/ui/text'
import { Trans } from '@lingui/react/macro'
import { ChevronRight } from '~/src/components/icons/ChevronRight'
import { Profile } from '~/src/components/icons/Profile'
import { ButtonGroup } from '~/src/components/ButtonGroup'
import { useAuth } from '~/src/providers/AuthProvider'
import { Languages } from '~/src/components/icons/Languages'

export default function ProfileSettings() {
  const { logOut } = useAuth()

  return (
    <ScrollView className="flex-1 p-6" contentContainerClassName="gap-4">
      <H1>
        <Trans>Settings</Trans>
      </H1>
      <View className="gap-6">
        <ButtonGroup>
          <Link href="/profile/settings/account" asChild>
            <Button variant="outline" size="lg" className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <Profile className="size-5 color-foreground" />
                <Text>
                  <Trans>Account</Trans>
                </Text>
              </View>
              <ChevronRight className="color-foreground" />
            </Button>
          </Link>
          <Link href="/profile/settings/language" asChild>
            <Button variant="outline" size="lg" className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <Languages className="size-5 color-foreground" />
                <Text>
                  <Trans>Language</Trans>
                </Text>
              </View>
              <ChevronRight className="color-foreground" />
            </Button>
          </Link>
        </ButtonGroup>
        <Button onPress={logOut} variant="destructive" size="lg">
          <Text>
            <Trans>Sign out</Trans>
          </Text>
        </Button>
      </View>
    </ScrollView>
  )
}
