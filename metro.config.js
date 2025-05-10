const { getDefaultConfig } = require('expo/metro-config')
const { withNativeWind } = require('nativewind/metro')

const config = getDefaultConfig(__dirname)

// ! Added the following line while this issue is not fixed:
// ! https://github.com/supabase/realtime-js/issues/415
config.resolver.unstable_enablePackageExports = false

module.exports = withNativeWind(config, { input: './global.css' })
