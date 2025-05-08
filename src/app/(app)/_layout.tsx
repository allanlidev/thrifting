import { SplashScreen, Stack } from 'expo-router'
import { useEffect } from 'react'
import { useAuth } from '~/src/providers/AuthProvider'

SplashScreen.preventAutoHideAsync()

export default function AppLayout() {
  const { isReady: isAuthReady, isLoggedIn } = useAuth()

  useEffect(() => {
    // Hide the splash screen after the auth state is ready
    if (!isAuthReady) return
    SplashScreen.hideAsync()
  }, [isAuthReady])

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={isLoggedIn}>
        <Stack.Screen name="(logged-in)" />
      </Stack.Protected>

      <Stack.Protected guard={!isLoggedIn}>
        <Stack.Screen name="index" />
        <Stack.Screen
          name="login"
          options={{ headerShown: true, title: '', headerBackButtonDisplayMode: 'generic' }}
        />
        <Stack.Screen
          name="signup"
          options={{ headerShown: true, title: '', headerBackButtonDisplayMode: 'generic' }}
        />
      </Stack.Protected>
    </Stack>
  )
}
