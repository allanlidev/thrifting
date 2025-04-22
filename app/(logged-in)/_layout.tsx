import { Redirect, Stack } from 'expo-router'
import { useSession } from '~/components/SessionProvider'

export default function ProtectedLayout() {
  const { isReady, isLoggedIn } = useSession()

  if (!isReady) return null

  if (!isLoggedIn) return <Redirect href="/login" />

  return <Stack screenOptions={{ headerShown: false }} />
}
