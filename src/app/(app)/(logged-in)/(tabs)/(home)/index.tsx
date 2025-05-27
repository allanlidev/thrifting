import { Trans } from '@lingui/react/macro'
import { FlashList } from '@shopify/flash-list'
import { ActivityIndicator, View, ViewProps } from 'react-native'
import { Listing, ListingSkeleton } from '~/src/components/Listing'
import { H1, Muted } from '~/src/components/ui/typography'
import { useListings } from '~/src/hooks/queries/listings'
import { useAuth } from '~/src/providers/AuthProvider'
import { Frown } from '~/src/components/icons/Frown'
import { cn } from '~/src/lib/utils'

const Container = ({ className, ...props }: ViewProps) => (
  <View className={cn(['pt-safe-offset-6 flex-1', className])} {...props} />
)

const Header = () => (
  <H1 className="mb-8 px-6 text-center">
    <Trans>welcome to thrifting</Trans>
  </H1>
)

export default function Home() {
  const { session } = useAuth()
  const { data, isError, isFetchingNextPage, isLoading, fetchNextPage, hasNextPage } = useListings({
    status: 'published',
    userId: session?.user?.id,
    limit: 8,
  })

  const listings = data?.pages?.flat() ?? []

  if (isLoading) {
    return (
      <FlashList
        data={Array(8)}
        renderItem={() => (
          <View className="flex-1 items-center">
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
      <Container>
        <Header />
        <View className="flex-1 items-center justify-center gap-4">
          <Frown className="size-12 color-muted-foreground" />
          <Muted className="mx-auto">
            <Trans>Oops! Something went wrong.</Trans>
          </Muted>
        </View>
      </Container>
    )
  }

  if (!listings.length) {
    return (
      <Container>
        <Header />
        <View className="flex-1 items-center justify-center gap-4">
          <Frown className="mx-auto size-12 color-muted-foreground" />
          <Muted className="mx-auto">
            <Trans>No listings found.</Trans>
          </Muted>
        </View>
      </Container>
    )
  }

  return (
    <FlashList
      data={listings}
      renderItem={({ item }) => (
        <View key={item.id} className="flex-1 items-center">
          <Listing item={item} />
        </View>
      )}
      estimatedItemSize={180}
      numColumns={2}
      ListHeaderComponent={Header}
      ListFooterComponent={() =>
        isFetchingNextPage && <ActivityIndicator size="large" className="m-4" />
      }
      onEndReached={() => {
        hasNextPage && fetchNextPage()
      }}
      contentContainerClassName="pt-safe-offset-6 pb-8"
    />
  )
}
