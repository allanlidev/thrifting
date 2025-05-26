import { Trans } from '@lingui/react/macro'
import { FlashList } from '@shopify/flash-list'
import { useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, View } from 'react-native'
import { Listing, ListingSkeleton } from '~/src/components/Listing'
import { H1, Muted } from '~/src/components/ui/typography'
import { useListings } from '~/src/hooks/queries/listings'
import { useAuth } from '~/src/providers/AuthProvider'
import { Frown } from '~/src/components/icons/Frown'

export default function Home() {
  const [isLoadingListings, setIsLoadingListings] = useState(true)

  const { session } = useAuth()
  const { isLoading, isError, data, isFetchingNextPage, hasNextPage, fetchNextPage } = useListings({
    userId: session?.user?.id ?? null,
    limit: 8,
  })

  const listings = useMemo(() => data?.pages?.flat(), [data])

  useEffect(() => {
    if (!isLoading) {
      setTimeout(() => {
        setIsLoadingListings(false)
      }, 500)
    }
  }, [isLoading])

  return (
    <View className="pt-safe-offset-6 flex-1 justify-center gap-4 px-6">
      {isError ? (
        <>
          <Frown className="mx-auto size-12 color-muted-foreground" />
          <Muted className="mx-auto">
            <Trans>Oops! Something went wrong.</Trans>
          </Muted>
        </>
      ) : (
        <FlashList
          data={isLoadingListings ? Array(8) : (listings ?? [])}
          renderItem={({ item }) => (
            <View className="flex-1 items-center">
              {isLoadingListings ? <ListingSkeleton /> : <Listing item={item} />}
            </View>
          )}
          estimatedItemSize={100}
          numColumns={2}
          ListHeaderComponent={() => (
            <H1 className="text-center">
              <Trans>welcome to thrifting</Trans>
            </H1>
          )}
          ListFooterComponent={() => (
            <View className="h-8">{isFetchingNextPage ? <ActivityIndicator /> : <></>}</View>
          )}
          onEndReached={() => {
            hasNextPage && fetchNextPage()
          }}
        />
      )}
    </View>
  )
}
