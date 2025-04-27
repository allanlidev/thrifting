import { LayoutChangeEvent, TouchableOpacity, View } from 'react-native'
import { useState } from 'react'
import { Large, Muted } from '~/components/ui/typography'
import { Avatar, AvatarFallback } from '~/components/ui/avatar'
import { Skeleton } from '~/components/ui/skeleton'
import { Badge } from '~/components/ui/badge'
import { Text } from '~/components/ui/text'

export function MyListing({ item, onPress }: { item: any; onPress?: () => void }) {
  const [titleWidth, setTitleWidth] = useState<number | undefined>()

  const onLayout = (event: LayoutChangeEvent) => {
    setTitleWidth(event.nativeEvent.layout.width)
  }

  return (
    <TouchableOpacity onPress={onPress}>
      <View className="mt-4 flex-1 flex-row gap-4">
        <Avatar alt="Product thumbnail" className="size-24 rounded-md">
          <AvatarFallback className="size-24 rounded-md" />
        </Avatar>
        <View className="flex-1 justify-center gap-2" onLayout={onLayout}>
          <Badge variant={item.published ? 'default' : 'secondary'} className="w-24">
            <Text>{item.published ? 'Published' : 'Draft'}</Text>
          </Badge>
          <Large
            numberOfLines={1}
            ellipsizeMode="tail"
            style={titleWidth ? { maxWidth: titleWidth } : undefined}
          >
            {item.title ?? 'No title'}
          </Large>
          <Muted>
            Edited: {new Date(item.updated_at).toLocaleString(undefined, { dateStyle: 'short' })}
          </Muted>
        </View>
      </View>
    </TouchableOpacity>
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
