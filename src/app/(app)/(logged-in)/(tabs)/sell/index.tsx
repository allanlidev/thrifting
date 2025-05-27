import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { ActivityIndicator, ScrollView, View, ViewProps } from 'react-native'
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

const Container = (props: ViewProps) => <View className="flex-1 gap-6" {...props} />

const NewListingButton = (props: ButtonProps) => <Button className="mx-6" {...props} />

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

  useEffect(() => {
    if (isLoading) {
      setIsLoadingDrafts(true)
    } else {
      setTimeout(() => {
        setIsLoadingDrafts(false)
      }, 500)
    }
  }, [isLoading])

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

    queryClient.invalidateQueries({ queryKey: ['listings', 'drafts'] })
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
        <View className="flex-1">
          <Frown className="mx-auto size-12 color-muted-foreground" />
          <Muted className="m-auto">
            <Trans>Oops! Something went wrong.</Trans>
          </Muted>
        </View>
        <NewListingButton disabled>
          <Text>
            <Trans>Create new listing</Trans>
          </Text>
        </NewListingButton>
      </Container>
    )
  }

  return (
    <Container>
      <View className="flex-1">
        {drafts.length ? (
          <FlashList
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
            refreshing={isRefetching}
            onRefresh={refetch}
          />
        ) : (
          <Muted className="m-auto">
            <Trans>Press "Create new listing" to start selling!</Trans>
          </Muted>
        )}
      </View>
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
