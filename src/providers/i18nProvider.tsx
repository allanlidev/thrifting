import React from 'react'
import { i18n } from '@lingui/core'
import { I18nProvider as DefaultI18nProvider } from '@lingui/react'

import { useLocaleLanguage } from '~/src/lib/i18n'

/**
 * I18nProvider component that wraps the application with the Lingui i18n provider.
 * It uses the custom useLocaleLanguage hook to set the locale based on the user's language preference.
 * @param children - The child components to be wrapped by the I18nProvider.
 * @returns The I18nProvider with the i18n instance and children.
 */
export function I18nProvider({ children }: { children: React.ReactNode }) {
  useLocaleLanguage()
  return <DefaultI18nProvider i18n={i18n}>{children}</DefaultI18nProvider>
}
