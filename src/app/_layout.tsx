import '~/global.css'

import { Theme, ThemeProvider, DefaultTheme, DarkTheme } from '@react-navigation/native'
import { Slot } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useLayoutEffect, useRef, useState } from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import Toast from 'react-native-toast-message'
import { PortalHost } from '~/src/components/PortalHost'
import { NAV_THEME } from '~/src/lib/constants'
import { useColorScheme } from '~/src/hooks/useColorScheme'
import { AuthProvider } from '~/src/providers/AuthProvider'
import { QueryProvider } from '~/src/providers/QueryProvider'
import { I18nProvider } from '~/src/providers/i18nProvider'
import { LanguagePreferenceProvider } from '~/src//providers/LanguagePreferenceProvider'

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

  // This effect runs only once when the component mounts to set the color scheme loaded state.
  useLayoutEffect(() => {
    if (hasMounted.current) {
      return
    }
    setIsColorSchemeLoaded(true)
    hasMounted.current = true
  }, [])

  // If the color scheme is not loaded yet, we return null to avoid rendering the layout prematurely.
  // This ensures that the theme is applied correctly before rendering any components, preventing flickering or incorrect styles.
  if (!isColorSchemeLoaded) {
    return null
  }

  return (
    <QueryProvider>
      <AuthProvider>
        <LanguagePreferenceProvider>
          <I18nProvider>
            <GestureHandlerRootView>
              <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
                <StatusBar style={isDarkColorScheme ? 'light' : 'dark'} />
                <Slot />
                <Toast />
                <PortalHost />
              </ThemeProvider>
            </GestureHandlerRootView>
          </I18nProvider>
        </LanguagePreferenceProvider>
      </AuthProvider>
    </QueryProvider>
  )
}
