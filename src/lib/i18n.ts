import '@formatjs/intl-locale/polyfill-force'
import '@formatjs/intl-pluralrules/polyfill-force'
import '@formatjs/intl-numberformat/polyfill-force'
import '@formatjs/intl-pluralrules/locale-data/en'
import '@formatjs/intl-numberformat/locale-data/en'

import { useEffect } from 'react'
import { i18n } from '@lingui/core'

import { messages as messagesEn } from '~/src/locales/en/messages'
import { messages as messagesFi } from '~/src/locales/fi/messages'
import { useLanguagePrefs } from '~/src/hooks/useLanguagePrefs'

enum AppLanguage {
  en = 'en',
  fi = 'fi',
}

/**
 * We do a dynamic import of just the catalog that we need
 */
export async function dynamicActivate(locale: AppLanguage) {
  switch (locale) {
    case AppLanguage.fi: {
      i18n.loadAndActivate({ locale, messages: messagesFi })
      await Promise.all([
        import('@formatjs/intl-pluralrules/locale-data/fi'),
        import('@formatjs/intl-numberformat/locale-data/fi'),
      ])
      break
    }
    default: {
      i18n.loadAndActivate({ locale, messages: messagesEn })
      break
    }
  }
}

export function useLocaleLanguage() {
  const { appLanguage } = useLanguagePrefs()
  useEffect(() => {
    dynamicActivate((appLanguage as AppLanguage) ?? AppLanguage.en)
  }, [appLanguage])
}
