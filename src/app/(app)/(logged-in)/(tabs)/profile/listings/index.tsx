import { FlashList } from '@shopify/flash-list'
import { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, RefreshControl, ScrollView, View, ViewProps } from 'react-native'
import { MyListing, MyListingSkeleton } from '~/src/components/MyListing'
import { Skeleton } from '~/src/components/ui/skeleton'
import { Tables } from '~/src/database.types'
import { useListings } from '~/src/hooks/queries/listings'
import { useAuth } from '~/src/providers/AuthProvider'
import { Frown } from '~/src/components/icons/Frown'
import { H1, Muted } from '~/src/components/ui/typography'
import { Trans } from '@lingui/react/macro'

const Container = (props: ViewProps) => <View className="flex-1 gap-6" {...props} />

export default function Listings() {
  const { session } = useAuth()
  const {
    data,
    isLoadingError,
    isLoading,
    isRefetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch,
  } = useListings({ own: true, status: 'published', userId: session?.user?.id, limit: 8 })

  const drafts = data?.pages.flat() ?? []

  const [isLoadingListings, setIsLoadingListings] = useState(false)

  const listRef = useRef<FlashList<Tables<'products'>>>(null)

  useEffect(() => {
    if (isLoading) {
      setIsLoadingListings(true)
    } else {
      setTimeout(() => {
        setIsLoadingListings(false)
      }, 500)
    }
  }, [isLoading])

  if (isLoadingListings) {
    return (
      <Container>
        <View className="mt-6 flex-1 overflow-hidden">
          <Skeleton className="mx-6 mb-4 h-10 w-40" />
          <View className="flex-1 gap-4 px-6">
            {Array.from({ length: 6 }, (_, index) => (
              <MyListingSkeleton key={index} />
            ))}
          </View>
        </View>
      </Container>
    )
  }

  if (isLoadingError) {
    return (
      <Container>
        <ScrollView
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
          contentContainerClassName="flex-1 items-center justify-center gap-3"
        >
          <Frown className="size-12 color-muted-foreground" />
          <Muted>
            <Trans>Oops! Something went wrong.</Trans>
          </Muted>
        </ScrollView>
      </Container>
    )
  }

  if (!drafts.length) {
    return (
      <Container>
        <ScrollView
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
          contentContainerClassName="flex-1 items-center justify-center"
        >
          <Muted>
            <Trans>You have no listings yet.</Trans>
          </Muted>
        </ScrollView>
      </Container>
    )
  }

  return (
    <Container>
      <FlashList
        ref={listRef}
        data={drafts}
        estimatedItemSize={120}
        renderItem={({ item }) => (
          <MyListing
            key={item.id}
            item={item}
            href={{ pathname: '/profile/listings/edit/[id]', params: { id: item.id } }}
            className="mb-4"
          />
        )}
        ListHeaderComponent={() => (
          <H1 className="mb-4 mt-6 px-6">
            <Trans>Listings</Trans>
          </H1>
        )}
        ListFooterComponent={() => isFetchingNextPage && <ActivityIndicator className="m-4" />}
        onEndReached={() => {
          hasNextPage && fetchNextPage()
        }}
        onEndReachedThreshold={0.1}
        refreshing={isRefetching}
        onRefresh={refetch}
      />
    </Container>
  )
}
