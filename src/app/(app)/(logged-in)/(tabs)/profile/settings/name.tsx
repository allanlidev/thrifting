import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { useState } from 'react'
import { ActivityIndicator, Alert, ScrollView, View } from 'react-native'
import { Button } from '~/src/components/ui/button'
import { Input } from '~/src/components/ui/input'
import { Label } from '~/src/components/ui/label'
import { Text } from '~/src/components/ui/text'
import { useUpdateProfile } from '~/src/hooks/queries/profiles'
import { useAuth } from '~/src/providers/AuthProvider'

export default function SettingsAccountFullName() {
  const { profile } = useAuth()
  const [fullName, setFullName] = useState(profile?.full_name ?? undefined)

  const { error, isPending, isSuccess, mutate } = useUpdateProfile()

  if (!profile) return null

  if (error) {
    Alert.alert(t`Oops! Something went wrong.`)
  } else if (isSuccess) {
    Alert.alert(t`Profile updated!`)
  }

  return (
    <ScrollView
      className="pb-safe-offset-2 p-6"
      contentContainerClassName="gap-7"
      automaticallyAdjustKeyboardInsets
    >
      <View className="w-full gap-2">
        <Label nativeID="nameInput">
          <Trans>Full name</Trans>
        </Label>
        <Input
          value={fullName}
          editable={!isPending}
          onChangeText={(text) => setFullName(text)}
          aria-labelledby="nameInput"
          aria-disabled={isPending}
          clearButtonMode="while-editing"
        />
      </View>
      <Button
        onPress={() =>
          mutate({
            id: profile.id,
            updates: { full_name: fullName },
          })
        }
        disabled={isPending}
        className="flex-row items-center gap-2 self-stretch"
      >
        {isPending && <ActivityIndicator />}
        <Text>{isPending ? t`Loading...` : t`Update`}</Text>
      </Button>
    </ScrollView>
  )
}
