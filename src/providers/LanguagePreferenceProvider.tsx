// LanguagePreferenceProvider.tsx

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { getLocales } from 'expo-localization'

export const APP_LANGUAGE_STORAGE_KEY = 'APP_LANGUAGE'

export const AppLanguage = {
  en: 'en',
  fi: 'fi',
} as const

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type AppLanguage = (typeof AppLanguage)[keyof typeof AppLanguage]

type LanguageContextValue = {
  preferredLanguage: AppLanguage
  isLoading: boolean
  setPreferredLanguage: (lang: AppLanguage) => Promise<void>
}

const defaultContext: LanguageContextValue = {
  preferredLanguage: AppLanguage.en,
  isLoading: true,
  setPreferredLanguage: async () => {},
}

const LanguagePreferenceContext = createContext<LanguageContextValue>(defaultContext)

type LanguagePreferenceProviderProps = {
  children: ReactNode
}

export const LanguagePreferenceProvider = ({ children }: LanguagePreferenceProviderProps) => {
  const deviceLocale = getLocales()[0].languageCode
  const [language, setLanguage] = useState(
    deviceLocale ? (deviceLocale as AppLanguage) : AppLanguage.en
  )
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function handlePreferredLanguage() {
      const savedLanguage = await AsyncStorage.getItem(APP_LANGUAGE_STORAGE_KEY)
      if (savedLanguage) setLanguage(savedLanguage as AppLanguage)
      setIsLoading(false)
    }
    handlePreferredLanguage()
  }, [])

  const setPreferredLanguage = async (lang: AppLanguage) => {
    try {
      await AsyncStorage.setItem(APP_LANGUAGE_STORAGE_KEY, lang)
      setLanguage(lang)
    } catch (error) {
      console.warn('Error saving language preference:', error)
    }
  }

  if (isLoading) {
    return null
  }

  return (
    <LanguagePreferenceContext.Provider
      value={{ preferredLanguage: language, isLoading, setPreferredLanguage }}
    >
      {children}
    </LanguagePreferenceContext.Provider>
  )
}

/**
 * Hook to access language preference
 */
export const useLanguagePreference = (): LanguageContextValue =>
  useContext(LanguagePreferenceContext)
