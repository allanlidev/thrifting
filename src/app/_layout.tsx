import '~/global.css'

import { Theme, ThemeProvider, DefaultTheme, DarkTheme } from '@react-navigation/native'
import { Slot } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useLayoutEffect, useRef, useState } from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import Toast from 'react-native-toast-message'
import { NAV_THEME } from '~/src/lib/constants'
import { useColorScheme } from '~/src/hooks/useColorScheme'
import { AuthProvider } from '~/src/providers/AuthProvider'
import { QueryProvider } from '~/src/providers/QueryProvider'
import { I18nProvider } from '~/src/providers/i18nProvider'

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
        <I18nProvider>
          <GestureHandlerRootView>
            <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
              <StatusBar style={isDarkColorScheme ? 'light' : 'dark'} translucent={false} />
              <Slot />
              <Toast />
            </ThemeProvider>
          </GestureHandlerRootView>
        </I18nProvider>
      </AuthProvider>
    </QueryProvider>
  )
}
