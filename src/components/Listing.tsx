import { Pressable, View } from 'react-native'
import { t } from '@lingui/core/macro'
import { Large } from '~/src/components/ui/typography'
import { Skeleton } from '~/src/components/ui/skeleton'
import { RemoteImage } from '~/src/components/RemoteImage'
import { Tables } from '~/src/database.types'
import { Text } from '~/src/components/ui/text'

export function Listing({ item, onPress }: { item: Tables<'products'>; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} className="active:opacity-50">
      <View className="mt-4 gap-2">
        <View className="h-40 w-40 overflow-hidden rounded-md bg-muted">
          {item.images.length > 0 && (
            <RemoteImage
              bucketId="product-images"
              path={item.images[0]}
              accessibilityLabel={`Thumbnail for listing`}
              className="h-full w-full"
              resizeMode="cover"
            />
          )}
          <Text className="absolute bottom-0 m-2 rounded-md bg-background/50 px-2 py-1">
            {item.price}€
          </Text>
        </View>
        <Large numberOfLines={3} ellipsizeMode="tail" className="w-40">
          {item.title ?? t`No title`}
        </Large>
      </View>
    </Pressable>
  )
}

export function ListingSkeleton() {
  return (
    <View className="mt-4 gap-3">
      <Skeleton className="h-40 w-40" />
      <Skeleton className="h-6 w-24" />
    </View>
  )
}
