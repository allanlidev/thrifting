import { Trans } from '@lingui/react/macro'
import { FlashList } from '@shopify/flash-list'
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  type ScrollViewProps,
  View,
} from 'react-native'
import { Listing, ListingSkeleton } from '~/src/components/Listing'
import { H1, Muted } from '~/src/components/ui/typography'
import { useListings } from '~/src/hooks/queries/listings'
import { useAuth } from '~/src/providers/AuthProvider'
import { Frown } from '~/src/components/icons/Frown'
import { cn } from '~/src/lib/utils'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useCallback, useRef } from 'react'
import { Tables } from '~/src/database.types'
import { useScrollToTop } from '@react-navigation/native'

const Header = () => (
  <H1 className="mb-8 px-6 text-center">
    <Trans>welcome to thrifting</Trans>
  </H1>
)

const Container = ({ className, children, ...props }: ScrollViewProps) => (
  <ScrollView contentContainerClassName={cn(['pt-safe-offset-6 flex-1', className])} {...props}>
    <Header />
    {children}
  </ScrollView>
)

export default function Home() {
  const { session } = useAuth()
  const {
    data,
    isError,
    isFetchingNextPage,
    isLoading,
    fetchNextPage,
    hasNextPage,
    refetch,
    isRefetching,
  } = useListings({
    status: 'published',
    userId: session?.user?.id,
    limit: 8,
  })
  const { top: safeAreaTop } = useSafeAreaInsets()

  const listings = data?.pages?.flat() ?? []

  const listRef = useRef<FlashList<Tables<'products'>>>(null)

  useScrollToTop(listRef)

  // Calculate the margin for each listing based on its index
  const getListingMargin = useCallback(
    (index: number) => (index % 2 === 0 ? 'ml-6 mr-3' : 'ml-3 mr-6'),
    []
  )

  if (isLoading) {
    return (
      <FlashList
        data={Array(8)}
        renderItem={({ index }) => (
          <View className={cn('mb-6 flex-1 items-center', getListingMargin(index))}>
            <ListingSkeleton />
          </View>
        )}
        estimatedItemSize={180}
        numColumns={2}
        ListHeaderComponent={Header}
        contentContainerClassName="pt-safe-offset-6"
      />
    )
  }

  if (isError) {
    return (
      <Container
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            progressViewOffset={safeAreaTop}
          />
        }
      >
        <View className="flex-1 items-center justify-center gap-3">
          <Frown className="size-12 color-muted-foreground" />
          <Muted>
            <Trans>Oops! Something went wrong.</Trans>
          </Muted>
        </View>
      </Container>
    )
  }

  if (!listings.length) {
    return (
      <Container
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            progressViewOffset={safeAreaTop}
          />
        }
      >
        <View className="flex-1 items-center justify-center gap-4">
          <Frown className="size-12 color-muted-foreground" />
          <Muted>
            <Trans>No listings found.</Trans>
          </Muted>
        </View>
      </Container>
    )
  }

  return (
    <FlashList
      ref={listRef}
      data={listings}
      renderItem={({ item, index }) => (
        <View key={item.id} className={cn('mb-6 flex-1', getListingMargin(index))}>
          <Listing item={item} href={{ pathname: '/listing/[id]', params: { id: item.id } }} />
        </View>
      )}
      estimatedItemSize={180}
      numColumns={2}
      ListHeaderComponent={Header}
      ListFooterComponent={() => isFetchingNextPage && <ActivityIndicator className="m-4" />}
      onEndReached={() => {
        hasNextPage && fetchNextPage()
      }}
      refreshing={isRefetching}
      onRefresh={refetch}
      progressViewOffset={safeAreaTop}
      contentContainerClassName="pt-safe-offset-6 pb-8"
    />
  )
}
