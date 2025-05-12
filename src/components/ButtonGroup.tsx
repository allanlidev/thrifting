import React, { ReactElement, isValidElement } from 'react'
import { View } from 'react-native'
import { ButtonProps } from '~/src/components/ui/button'

/**
 * ButtonGroupProps
 * children must be a Button element or an array of Button elements
 */
type ButtonGroupProps = {
  children: ReactElement<ButtonProps> | ReactElement<ButtonProps>[]
}

/**
 * ButtonGroup wrapper for Tailwind-styled Buttons
 *
 * 1) If only one child, renders it as-is.
 * 2) If >1 children:
 *    - First:    keep top border-radius, remove bottom radii
 *    - Middle:   remove all radii + top border
 *    - Last:     keep bottom border-radius, remove top radii + top border
 */
export function ButtonGroup({ children }: ButtonGroupProps) {
  // Normalize and filter only valid ReactElements
  const items = React.Children.toArray(children)
    .filter(isValidElement)
    // Now tell TypeScript these are ReactElement<ButtonProps>
    .map((el) => el as ReactElement<ButtonProps>)

  const count = items.length

  // Single button — no grouping needed
  if (count === 1) {
    return <View>{items[0]}</View>
  }

  // Multiple buttons — clone with injected classes
  const enhanced = items.map((child, idx) => {
    let extraClasses = ''

    if (idx === 0) {
      // First: no bottom radii
      extraClasses = 'rounded-b-none'
    } else if (idx === count - 1) {
      // Last: no top radii + no top border
      extraClasses += 'rounded-t-none border-t-0'
    } else {
      // Middle: no radii + no top border
      extraClasses += 'rounded-none border-t-0'
    }

    // Merge with any existing className on the child
    const prevClasses = child.props.className ?? ''
    const className = [prevClasses, extraClasses].join(' ').trim()

    return React.cloneElement<ButtonProps>(child, {
      className,
      key: idx,
    })
  })

  return <View>{enhanced}</View>
}
