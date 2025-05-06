import '~/global.css'

import { Theme, ThemeProvider, DefaultTheme, DarkTheme } from '@react-navigation/native'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useLayoutEffect, useRef, useState } from 'react'
import { NAV_THEME } from '~/lib/constants'
import { useColorScheme } from '~/lib/useColorScheme'
import { AuthProvider } from '~/providers/AuthProvider'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { QueryProvider } from '~/providers/QueryProvider'

const LIGHT_THEME: Theme = {
  ...DefaultTheme,
  colors: NAV_THEME.light,
}
const DARK_THEME: Theme = {
  ...DarkTheme,
  colors: NAV_THEME.dark,
}

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router'

export default function RootLayout() {
  const hasMounted = useRef(false)
  const { isDarkColorScheme } = useColorScheme()
  const [isColorSchemeLoaded, setIsColorSchemeLoaded] = useState(false)

  useLayoutEffect(() => {
    if (hasMounted.current) {
      return
    }
    setIsColorSchemeLoaded(true)
    hasMounted.current = true
  }, [])

  if (!isColorSchemeLoaded) {
    return null
  }

  return (
    <QueryProvider>
      <AuthProvider>
        <GestureHandlerRootView>
          <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
            <StatusBar style={isDarkColorScheme ? 'light' : 'dark'} translucent={false} />
            <Stack screenOptions={{ animation: 'none' }}>
              <Stack.Screen
                name="(logged-in)"
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="login"
                options={{
                  presentation: 'modal',
                  headerTitle: 'Login',
                }}
              />
            </Stack>
          </ThemeProvider>
        </GestureHandlerRootView>
      </AuthProvider>
    </QueryProvider>
  )
}
