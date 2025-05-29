import { Trans } from '@lingui/react/macro'
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  ScrollViewProps,
  TextInputProps,
  View,
} from 'react-native'
import { Input } from '~/src/components/ui/input'
import { Search } from '~/src/components/icons/Search'
import { useSearchListings } from '~/src/hooks/queries/listings'
import { useAuth } from '~/src/providers/AuthProvider'
import { FlashList } from '@shopify/flash-list'
import { cn } from '~/src/lib/utils'
import { Listing, ListingSkeleton } from '~/src/components/Listing'
import { Frown } from '~/src/components/icons/Frown'
import { useScrollToTop } from '@react-navigation/native'
import { Tables } from '~/src/database.types'
import { useCallback, useRef, useState } from 'react'
import { Muted } from '~/src/components/ui/typography'
import { t } from '@lingui/core/macro'

const Container = ({ className, children, ...props }: ScrollViewProps) => (
  <ScrollView contentContainerClassName={cn(['flex-1', className])} {...props}>
    {children}
  </ScrollView>
)

function SearchResults({ query }: { query: ReturnType<typeof useSearchListings> }) {
  const listRef = useRef<FlashList<Tables<'products'>>>(null)

  const {
    data,
    isError,
    isFetchingNextPage,
    isLoading,
    fetchNextPage,
    hasNextPage,
    refetch,
    isRefetching,
  } = query

  const listings = data?.pages?.flat() ?? []

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
      />
    )
  }

  if (isError) {
    return (
      <Container refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}>
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
      <Container refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}>
        <View className="flex-1 items-center justify-center gap-4">
          <Search className="size-12 color-muted-foreground" />
          <Muted>
            <Trans>Type something to search.</Trans>
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
          <Listing
            item={item}
            href={{ pathname: '/search/listing/[id]', params: { id: item.id } }}
          />
        </View>
      )}
      estimatedItemSize={180}
      numColumns={2}
      ListFooterComponent={() => isFetchingNextPage && <ActivityIndicator className="m-4" />}
      onEndReached={() => {
        hasNextPage && fetchNextPage()
      }}
      refreshing={isRefetching}
      onRefresh={refetch}
      contentContainerClassName="pb-8"
    />
  )
}

function Header({ inputProps }: { inputProps: TextInputProps }) {
  return (
    <View className="px-6 pb-8">
      <View className="flex-row justify-start rounded-md border border-input">
        <Search className="my-3 ml-4 color-muted-foreground" />
        <Input
          className="my-1 flex-1 border-0"
          placeholder={t`Search for listings...`}
          {...inputProps}
        />
      </View>
    </View>
  )
}

export default function SearchIndex() {
  const [searchQuery, setSearchQuery] = useState('')
  const { session } = useAuth()
  const query = useSearchListings({
    query: searchQuery,
    userId: session?.user?.id,
  })

  return (
    <View className="pt-safe-offset-6 flex-1">
      <Header inputProps={{ onChangeText: (text) => setSearchQuery(text), value: searchQuery }} />
      <SearchResults query={query} />
    </View>
  )
}
