import { Redirect, Stack } from 'expo-router'
import { useAuth } from '~/providers/AuthProvider'

export default function ProtectedLayout() {
  const { isReady, isLoggedIn } = useAuth()

  if (!isReady) return null

  if (!isLoggedIn) return <Redirect href="/login" />

  return <Stack screenOptions={{ headerShown: false }} />
}
