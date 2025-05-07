import { defineConfig } from '@lingui/conf'

export default defineConfig({
  sourceLocale: 'en',
  locales: ['en', 'fi'],
  catalogs: [
    {
      path: '<rootDir>/lib/locales/{locale}/messages',
      include: ['app', 'components', 'lib'],
    },
  ],
  fallbackLocales: { default: 'en' },
})
