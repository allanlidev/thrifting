import '@formatjs/intl-locale/polyfill-force'
import '@formatjs/intl-pluralrules/polyfill-force'
import '@formatjs/intl-numberformat/polyfill-force'
import '@formatjs/intl-pluralrules/locale-data/en'
import '@formatjs/intl-numberformat/locale-data/en'

import { useEffect } from 'react'
import { i18n } from '@lingui/core'
import { setErrorMap, type ZodErrorMap } from 'zod'
import { t } from '@lingui/core/macro'

import { messages as messagesEn } from '~/src/locales/en/messages'
import { messages as messagesFi } from '~/src/locales/fi/messages'
import { AppLanguage, useLanguagePreference } from '~/src/providers/LanguagePreferenceProvider'

/**
 * Dynamically activates the i18n locale based on the provided AppLanguage.
 * It loads the corresponding messages and locale data for plural rules and number formatting.
 * @param locale - The AppLanguage to activate.
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

/**
 * Custom hook to set the locale language based on the user's language preference.
 * It activates the i18n locale dynamically whenever the preferred language changes.
 */
export function useLocaleLanguage() {
  const { preferredLanguage } = useLanguagePreference()
  useEffect(() => {
    dynamicActivate((preferredLanguage as AppLanguage) ?? AppLanguage.en)
  }, [preferredLanguage])
}

// Custom error map for Zod validation errors
const i18nErrorMap: ZodErrorMap = (issue, ctx) => {
  // 1) Built-in min-length check on strings
  if (issue.code === 'too_small' && issue.type === 'string') {
    return {
      message: t`Password must be at least ${issue.minimum as number} characters long.`,
    }
  }

  // 2) Our custom refine rules all come through as "custom"
  if (issue.code === 'custom' && issue.params && typeof issue.params.rule === 'string') {
    switch (issue.params.rule) {
      case 'lowercase':
        return {
          message: t`Password must contain at least one lowercase letter.`,
        }
      case 'uppercase':
        return {
          message: t`Password must contain at least one uppercase letter.`,
        }
      case 'digit':
        return {
          message: t`Password must contain at least one digit.`,
        }
      case 'special':
        return {
          message: t`Password must contain at least one special character: !@#$%^&*()_+-=[]{};':"|<>?,./\`~`,
        }
    }
  }

  // Fallback to Zod’s default (or any other ctx.defaultError)
  return { message: ctx.defaultError }
}

// Apply globally
setErrorMap(i18nErrorMap)
