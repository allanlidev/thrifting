import { Pressable, View } from 'react-native'
import { t } from '@lingui/core/macro'
import { Large } from '~/src/components/ui/typography'
import { Skeleton } from '~/src/components/ui/skeleton'
import { RemoteImage } from '~/src/components/RemoteImage'
import { Tables } from '~/src/database.types'
import { Text } from '~/src/components/ui/text'

export function Listing({ item, onPress }: { item: Tables<'products'>; onPress?: () => void }) {
  return (
    <Pressable className="active:opacity-75" onPress={onPress}>
      <View className="w-full gap-2">
        <View className="h-40 overflow-hidden rounded-md bg-muted">
          {item.images.length > 0 && (
            <RemoteImage
              bucketId="product-images"
              path={item.images[0]}
              accessibilityLabel={t`Image of "${item.title}" listing`}
              className="size-full"
            />
          )}
          <Text className="absolute bottom-2 left-2 rounded-md bg-background/50 px-2 py-1">
            {item.price}€
          </Text>
        </View>
        <Large numberOfLines={2}>{item.title ?? t`No title`}</Large>
      </View>
    </Pressable>
  )
}

export function ListingSkeleton() {
  return (
    <View className="w-full gap-2">
      <Skeleton className="h-40" />
      <Skeleton className="h-6 w-24" />
    </View>
  )
}
