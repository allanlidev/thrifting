import { SplashScreen, Stack } from 'expo-router'
import { useEffect } from 'react'
import { useAuth } from '~/src/providers/AuthProvider'

SplashScreen.preventAutoHideAsync()

export default function AppLayout() {
  const { isReady: isAuthReady, isLoggedIn } = useAuth()

  useEffect(() => {
    SplashScreen.hideAsync()
  }, [isAuthReady])

  return (
    <Stack screenOptions={{ animation: 'none' }}>
      <Stack.Protected guard={!isLoggedIn}>
        <Stack.Screen
          name="login"
          options={{
            headerTitle: 'Login',
          }}
        />
      </Stack.Protected>
      <Stack.Protected guard={isLoggedIn}>
        <Stack.Screen
          name="(logged-in)"
          options={{
            headerShown: false,
          }}
        />
      </Stack.Protected>
    </Stack>
  )
}
