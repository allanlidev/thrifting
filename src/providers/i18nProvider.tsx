import React from 'react'
import { i18n } from '@lingui/core'
import { I18nProvider as DefaultI18nProvider } from '@lingui/react'

import { useLocaleLanguage } from '~/src/lib/i18n'

export function I18nProvider({ children }: { children: React.ReactNode }) {
  useLocaleLanguage()
  return <DefaultI18nProvider i18n={i18n}>{children}</DefaultI18nProvider>
}
