import { Button, type ButtonProps } from '~/src/components/ui/button'
import { Text } from '~/src/components/ui/text'
import * as RadioGroupPrimitive from '@rn-primitives/radio-group'
import { View } from 'react-native'

type Props = {
  value: string
  label?: string
} & ButtonProps

export default function RadioGroupButton({ value, label, ...rest }: Props) {
  return (
    <RadioGroupPrimitive.Item value={value} className="flex-row justify-between" asChild>
      <Button {...rest}>
        <Text>{label ?? value}</Text>
        <RadioGroupPrimitive.Indicator>
          <View className="aspect-square size-4/12 rounded-full bg-primary" />
        </RadioGroupPrimitive.Indicator>
      </Button>
    </RadioGroupPrimitive.Item>
  )
}
