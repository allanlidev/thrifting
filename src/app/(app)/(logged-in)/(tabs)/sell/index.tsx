import { useRouter } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, RefreshControl, ScrollView, View, ViewProps } from 'react-native'
import Toast from 'react-native-toast-message'
import { useQueryClient } from '@tanstack/react-query'
import { Trans } from '@lingui/react/macro'
import { t } from '@lingui/core/macro'
import { MyListing, MyListingSkeleton } from '~/src/components/MyListing'
import { Button, ButtonProps } from '~/src/components/ui/button'
import { Text } from '~/src/components/ui/text'
import { H1, Muted } from '~/src/components/ui/typography'
import { useListings } from '~/src/hooks/queries/listings'
import { supabase } from '~/src/lib/supabase'
import { Frown } from '~/src/components/icons/Frown'
import { FlashList } from '@shopify/flash-list'
import { Skeleton } from '~/src/components/ui/skeleton'
import { useScrollToTop } from '@react-navigation/native'
import { Tables } from '~/src/database.types'

const Container = (props: ViewProps) => <View className="flex-1 gap-6" {...props} />

const NewListingButton = (props: ButtonProps) => <Button className="mx-6 mb-4" {...props} />

export default function Sell() {
  const router = useRouter()
  const {
    data,
    isLoadingError,
    isLoading,
    isRefetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch,
  } = useListings({ status: 'draft' })
  const queryClient = useQueryClient()

  const drafts = data?.pages.flat() ?? []

  const [isLoadingDrafts, setIsLoadingDrafts] = useState(false)
  const [isLoadingNewListing, setIsLoadingNewListing] = useState(false)

  const listRef = useRef<FlashList<Tables<'products'>>>(null)

  useScrollToTop(listRef)

  useEffect(() => {
    if (isLoading) {
      setIsLoadingDrafts(true)
    } else {
      setTimeout(() => {
        setIsLoadingDrafts(false)
      }, 500)
    }
  }, [isLoading])

  /**
   * Create a new listing.
   * This function inserts a new empty product into the database
   * and redirects the user to the edit page for that product.
   */
  const createNewListing = async () => {
    setIsLoadingNewListing(true)

    const { data, error } = await supabase.from('products').insert([{}]).select()

    setIsLoadingNewListing(false)

    if (error) {
      Toast.show({
        type: 'error',
        text1: t`Oops! Something went wrong.`,
      })
      return
    }

    queryClient.invalidateQueries({ queryKey: ['listings', 'draft'], exact: false })
    router.push({ pathname: '/sell/edit/[id]', params: { id: data[0].id } })
  }

  if (isLoadingDrafts) {
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
        <NewListingButton disabled>
          <Text>
            <Trans>Create new listing</Trans>
          </Text>
        </NewListingButton>
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
        <NewListingButton disabled>
          <Text>
            <Trans>Create new listing</Trans>
          </Text>
        </NewListingButton>
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
            <Trans>Press "Create new listing" to start selling!</Trans>
          </Muted>
        </ScrollView>
        <NewListingButton disabled={isLoadingNewListing} onPress={createNewListing}>
          {isLoadingNewListing ? (
            <ActivityIndicator />
          ) : (
            <Text>
              <Trans>Create new listing</Trans>
            </Text>
          )}
        </NewListingButton>
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
            href={{ pathname: '/sell/edit/[id]', params: { id: item.id } }}
            className="mt-4"
          />
        )}
        ListHeaderComponent={() => (
          <H1 className="mt-6 px-6">
            <Trans>Drafts</Trans>
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
      <NewListingButton disabled={isLoadingNewListing} onPress={createNewListing}>
        {isLoadingNewListing ? (
          <ActivityIndicator />
        ) : (
          <Text>
            <Trans>Create new listing</Trans>
          </Text>
        )}
      </NewListingButton>
    </Container>
  )
}
