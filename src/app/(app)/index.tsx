import { Trans } from '@lingui/react/macro'
import { Link } from 'expo-router'
import { View } from 'react-native'
import { Button } from '~/src/components/ui/button'
import { H1, P } from '~/src/components/ui/typography'
import { Text } from '~/src/components/ui/text'
import Animated, { Easing, FadeInDown, FadeInLeft, FadeInRight } from 'react-native-reanimated'

export default function Welcome() {
  return (
    <View className="py-safe-offset-2 flex-1 items-center p-6">
      <View className="flex-1 items-center justify-end gap-3">
        <Animated.View entering={FadeInLeft.duration(500).easing(Easing.inOut(Easing.ease))}>
          <H1 className="text-6xl">thrifting</H1>
        </Animated.View>
        <Animated.View
          entering={FadeInRight.duration(500).delay(400).easing(Easing.inOut(Easing.ease))}
        >
          <P className="text-center text-4xl">the place to buy & sell second hand</P>
        </Animated.View>
      </View>
      <View className="w-full flex-1 justify-end gap-3">
        <Animated.View
          entering={FadeInDown.duration(500).delay(800).easing(Easing.inOut(Easing.ease))}
        >
          <Link href="/login" asChild>
            <Button>
              <Text>
                <Trans>Sign in</Trans>
              </Text>
            </Button>
          </Link>
        </Animated.View>
        <Animated.View
          entering={FadeInDown.duration(500).delay(1000).easing(Easing.inOut(Easing.ease))}
        >
          <Link href="/signup" asChild>
            <Button variant="secondary">
              <Text>
                <Trans>Register now</Trans>
              </Text>
            </Button>
          </Link>
        </Animated.View>
      </View>
    </View>
  )
}
