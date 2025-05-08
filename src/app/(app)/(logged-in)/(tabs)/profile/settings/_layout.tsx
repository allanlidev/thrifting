import { t } from '@lingui/core/macro'
import { Stack } from 'expo-router'

export default function SettingsLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: t`Settings` }} />
      <Stack.Screen name="account" options={{ title: t`Account` }} />
      <Stack.Screen name="name" options={{ title: t`Full Name` }} />
      <Stack.Screen name="password" options={{ title: t`Password` }} />
    </Stack>
  )
}
