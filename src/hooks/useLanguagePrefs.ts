import AsyncStorage from '@react-native-async-storage/async-storage'
import { getLocales, type Locale } from 'expo-localization'
import { useEffect, useState } from 'react'

export function useLanguagePrefs() {
  const [language, setLanguage] = useState<Locale['languageCode']>(getLocales()[0].languageCode)

  useEffect(() => {
    async function handlePreferredLanguage() {
      const savedLanguage = await AsyncStorage.getItem('language')
      if (savedLanguage) setLanguage(savedLanguage)
    }
    handlePreferredLanguage()
  }, [])

  return { appLanguage: language }
}
