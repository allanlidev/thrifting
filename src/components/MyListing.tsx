import { Alert, type LayoutChangeEvent, View, ViewProps } from 'react-native'
import { useState } from 'react'
import { Trans } from '@lingui/react/macro'
import { t } from '@lingui/core/macro'
import { Large, Muted } from '~/src/components/ui/typography'
import { Skeleton } from '~/src/components/ui/skeleton'
import { Badge } from '~/src/components/ui/badge'
import { Text } from '~/src/components/ui/text'
import { RemoteImage } from '~/src/components/RemoteImage'
import { type Href, Link } from 'expo-router'
import { type Tables } from '~/src/database.types'
import Animated, { Easing, FadeOut, SharedValue, useAnimatedStyle } from 'react-native-reanimated'
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable'
import { Pressable } from 'react-native-gesture-handler'
import { Trash } from '~/src/components/icons/Trash'
import { useDeleteListing } from '~/src/hooks/queries/listings'

function RightAction(
  _prog: SharedValue<number>,
  drag: SharedValue<number>,
  itemId: Tables<'products'>['id']
) {
  const { mutateAsync } = useDeleteListing({ status: 'draft' })
  const styleAnimation = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: drag.value + 200 }],
    }
  })

  const onDelete = async () => {
    Alert.alert(
      t`Delete listing`,
      t`Are you sure you want to delete this listing? This action cannot be undone.`,
      [
        {
          text: t`Cancel`,
          style: 'cancel',
        },
        {
          text: t`Delete`,
          style: 'destructive',
          onPress: async () => {
            try {
              await mutateAsync(itemId)
            } catch (error) {
              Alert.alert(t`Oops! Something went wrong.`)
            }
          },
        },
      ]
    )
  }

  return (
    <Pressable onPress={onDelete}>
      <Animated.View
        style={styleAnimation}
        className="h-full w-52 items-center justify-center bg-destructive"
      >
        <Trash className="color-primary" />
      </Animated.View>
    </Pressable>
  )
}

export function MyListing({
  item,
  href,
  className,
}: {
  item: Tables<'products'>
  href: Href
  className?: ViewProps['className']
}) {
  const [titleWidth, setTitleWidth] = useState<number | undefined>()

  const onLayout = (event: LayoutChangeEvent) => {
    setTitleWidth(event.nativeEvent.layout.width)
  }

  return (
    <Animated.View
      className={className}
      exiting={FadeOut.duration(150).easing(Easing.inOut(Easing.quad))}
    >
      <ReanimatedSwipeable
        friction={2}
        enableTrackpadTwoFingerGesture
        rightThreshold={40}
        overshootRight={false}
        enableContextMenu
        renderRightActions={(progress, translation) => RightAction(progress, translation, item.id)}
      >
        <Link href={href} className="active:opacity-50">
          <View className="mt-4 flex-1 flex-row gap-4 pl-6">
            <View className="h-24 w-24 rounded-md bg-muted">
              {item.images.length > 0 && (
                <RemoteImage
                  bucketId="product-images"
                  path={item.images[0]}
                  accessibilityLabel={`Thumbnail for listing`}
                  className="h-full w-full"
                  resizeMode="cover"
                />
              )}
            </View>
            <View className="flex-1 justify-center gap-2" onLayout={onLayout}>
              <Badge
                variant={item.published ? 'default' : 'secondary'}
                className="pointer-events-none w-24"
              >
                <Text>{item.published ? t`Published` : t`Draft`}</Text>
              </Badge>
              <Large
                numberOfLines={1}
                ellipsizeMode="tail"
                style={titleWidth ? { maxWidth: titleWidth } : undefined}
              >
                {item.title ?? t`No title`}
              </Large>
              <Muted>
                <Trans>Edited</Trans>:{' '}
                {item.updated_at &&
                  new Date(item.updated_at).toLocaleString(undefined, { dateStyle: 'short' })}
              </Muted>
            </View>
          </View>
        </Link>
      </ReanimatedSwipeable>
    </Animated.View>
  )
}

export function MyListingSkeleton() {
  return (
    <View className="w-full flex-row gap-3">
      <Skeleton className="h-24 w-24" />
      <View className="justify-center gap-2">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-5 w-32" />
      </View>
    </View>
  )
}
