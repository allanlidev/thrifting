import { t } from '@lingui/core/macro'
import { Stack } from 'expo-router'

export default function ProfileLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="edit" options={{ headerTitle: t`Profile`, presentation: 'modal' }} />
    </Stack>
  )
}
