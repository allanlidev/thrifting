import { Platform } from 'react-native'
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated'
import { Text } from '~/src/components/ui/text'

export function ErrorMessage({ msg, id }: { msg: string; id?: string }) {
  if (Platform.OS === 'web') {
    return (
      <Text
        className="native:px-1 web:animate-in web:zoom-in-95 py-1.5 text-sm text-destructive"
        aria-invalid="true"
        id={id}
      >
        {msg}
      </Text>
    )
  }
  return (
    <Animated.Text
      entering={FadeInDown}
      exiting={FadeOut.duration(275)}
      className="native:px-1 py-1.5 text-sm text-destructive"
      aria-invalid="true"
      id={id}
    >
      {msg}
    </Animated.Text>
  )
}
