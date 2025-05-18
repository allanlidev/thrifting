import { LayoutChangeEvent, Pressable, View } from 'react-native'
import { useState } from 'react'
import { Trans } from '@lingui/react/macro'
import { t } from '@lingui/core/macro'
import { Large, Muted } from '~/src/components/ui/typography'
import { Skeleton } from '~/src/components/ui/skeleton'
import { Badge } from '~/src/components/ui/badge'
import { Text } from '~/src/components/ui/text'
import { RemoteImage } from '~/src/components/RemoteImage'

export function MyListing({ item, onPress }: { item: any; onPress?: () => void }) {
  const [titleWidth, setTitleWidth] = useState<number | undefined>()

  const onLayout = (event: LayoutChangeEvent) => {
    setTitleWidth(event.nativeEvent.layout.width)
  }

  return (
    <Pressable onPress={onPress} className="active:opacity-50">
      <View className="mt-4 flex-1 flex-row gap-4">
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
            {new Date(item.updated_at).toLocaleString(undefined, { dateStyle: 'short' })}
          </Muted>
        </View>
      </View>
    </Pressable>
  )
}

export function MyListingSkeleton() {
  return (
    <View className="mt-4 w-full flex-row gap-3">
      <Skeleton className="h-24 w-24" />
      <View className="justify-center gap-2">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-5 w-32" />
      </View>
    </View>
  )
}
