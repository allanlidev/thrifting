import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { Link } from 'expo-router'
import { useState } from 'react'
import { ActivityIndicator, Alert, ScrollView, View } from 'react-native'
import { ButtonGroup } from '~/src/components/ButtonGroup'
import { ChevronRight } from '~/src/components/icons/ChevronRight'
import { Button } from '~/src/components/ui/button'
import { Text } from '~/src/components/ui/text'
import { H2 } from '~/src/components/ui/typography'
import { supabase } from '~/src/lib/supabase'
import { useAuth } from '~/src/providers/AuthProvider'

export default function SettingsAccount() {
  const { session, profile, logOut } = useAuth()

  const [isDeleting, setIsDeleting] = useState(false)

  function handleDeleteAccount() {
    Alert.alert(
      'Delete account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: deleteAccount,
        },
      ]
    )
  }

  async function deleteAccount() {
    try {
      setIsDeleting(true)
      if (!session?.user) throw new Error('No user')
      await supabase.functions.invoke('user-self-deletion')
      alert('Account deleted successfully!')
    } catch (error) {
      alert('Error deleting the account!')
      console.log(error)
    } finally {
      setIsDeleting(false)
      // Note that you also will force a logout after completing it
      logOut()
    }
  }

  if (!session || !profile) return null

  return (
    <ScrollView
      className="pb-safe-offset-2 p-6"
      contentContainerClassName="flex-1 gap-7"
      automaticallyAdjustKeyboardInsets
    >
      <View className="gap-4">
        <H2 className="text-xl">
          <Trans>Account Information</Trans>
        </H2>
        <ButtonGroup>
          <Link href="/profile/settings/name" asChild>
            <Button className="flex-row items-center justify-between" variant="outline" size="lg">
              <Text>
                <Trans>Full name</Trans>
              </Text>
              <View className="flex-row items-center gap-2">
                <Text className="color-muted-foreground">{profile.full_name ?? t`Not set`}</Text>
                <ChevronRight className="color-foreground" />
              </View>
            </Button>
          </Link>
          <Button
            className="flex-row items-center justify-between opacity-100"
            variant="outline"
            size="lg"
            disabled
          >
            <Text>
              <Trans>Email</Trans>
            </Text>
            <View className="flex-row items-center gap-2">
              <Text className="color-muted-foreground">{session.user.email ?? t`Not set`}</Text>
              <ChevronRight className="color-foreground" />
            </View>
          </Button>
          <Link href="/profile/settings/password" asChild>
            <Button className="flex-row items-center justify-between" variant="outline" size="lg">
              <Text>
                <Trans>Password</Trans>
              </Text>
              <ChevronRight className="color-foreground" />
            </Button>
          </Link>
        </ButtonGroup>
      </View>
      <View className="gap-4">
        <H2 className="text-xl">
          <Trans>Account Management</Trans>
        </H2>
        <Button
          variant="destructive"
          onPress={handleDeleteAccount}
          disabled={isDeleting}
          className="flex-row items-center gap-2"
        >
          {isDeleting && <ActivityIndicator className="color-foreground" />}
          <Text>{isDeleting ? <Trans>Deleting...</Trans> : <Trans>Delete account</Trans>}</Text>
        </Button>
      </View>
    </ScrollView>
  )
}
