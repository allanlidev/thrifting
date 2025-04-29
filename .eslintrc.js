// https://docs.expo.dev/guides/using-eslint/
module.exports = {
  extends: ['plugin:@tanstack/query/recommended', 'expo', 'prettier'],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': 'error',
  },
}
