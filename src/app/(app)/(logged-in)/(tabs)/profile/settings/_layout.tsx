import { useLingui } from '@lingui/react'
import { t } from '@lingui/core/macro'
import { Stack } from 'expo-router'

export default function SettingsLayout() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { _ } = useLingui()

  return (
    <Stack screenOptions={{ headerBackTitle: t`Back` }}>
      <Stack.Screen name="index" options={{ title: t`Settings` }} />
      <Stack.Screen name="account" options={{ title: t`Account` }} />
      <Stack.Screen name="name" options={{ title: t`Full Name` }} />
      <Stack.Screen name="password" options={{ title: t`Password` }} />
      <Stack.Screen name="language" options={{ title: t`Language` }} />
    </Stack>
  )
}
