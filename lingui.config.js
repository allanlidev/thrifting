import { defineConfig } from '@lingui/conf'

export default defineConfig({
  sourceLocale: 'en',
  locales: ['en', 'fi'],
  catalogs: [
    {
      path: '<rootDir>/src/locales/{locale}/messages',
      include: ['src'],
    },
  ],
  fallbackLocales: { default: 'en' },
})
