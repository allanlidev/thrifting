import { useColorScheme as useNativewindColorScheme } from 'nativewind'

/**
 * Custom hook to manage color scheme in a React Native application.
 * This hook provides the current color scheme, a function to set a new color scheme,
 * and a function to toggle between light and dark modes.
 * @returns An object containing the current color scheme, a function to set a new color scheme,
 * and a function to toggle the color scheme.
 */
export function useColorScheme() {
  const { colorScheme, setColorScheme, toggleColorScheme } = useNativewindColorScheme()
  return {
    colorScheme: colorScheme ?? 'dark',
    isDarkColorScheme: colorScheme === 'dark',
    setColorScheme,
    toggleColorScheme,
  }
}
