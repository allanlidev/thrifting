import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { ActivityIndicator, ScrollView, View } from 'react-native'
import Toast from 'react-native-toast-message'
import { useQueryClient } from '@tanstack/react-query'
import { Trans } from '@lingui/react/macro'
import { t } from '@lingui/core/macro'
import { MyListing, MyListingSkeleton } from '~/src/components/MyListing'
import { Button } from '~/src/components/ui/button'
import { Text } from '~/src/components/ui/text'
import { Muted } from '~/src/components/ui/typography'
import { useDraftListings } from '~/src/hooks/queries/listings'
import { supabase } from '~/src/lib/supabase'
import { Frown } from '~/src/components/icons/Frown'
import { FlashList } from '@shopify/flash-list'

export default function Sell() {
  const router = useRouter()
  const { data: drafts, error: draftsError, isFetching: isDraftsFetching } = useDraftListings()
  const queryClient = useQueryClient()

  const [isLoadingDrafts, setIsLoadingDrafts] = useState(false)
  const [isLoadingNewListing, setIsLoadingNewListing] = useState(false)

  useEffect(() => {
    if (isDraftsFetching) {
      setIsLoadingDrafts(true)
    } else {
      setTimeout(() => {
        setIsLoadingDrafts(false)
      }, 500)
    }
  }, [isDraftsFetching])

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

  return (
    <View className="flex-1 gap-6 py-6">
      <View className="flex-1">
        {drafts && drafts.length > 0 && !isLoadingDrafts ? (
          <FlashList
            data={drafts}
            estimatedItemSize={112}
            renderItem={({ item }) => (
              <MyListing
                key={item.id}
                item={item}
                href={{ pathname: '/sell/edit/[id]', params: { id: item.id } }}
                className="my-2"
              />
            )}
          />
        ) : (
          <>
            {isLoadingDrafts ? (
              <ScrollView contentContainerClassName="gap-4 pl-6">
                {Array.from({ length: 6 }, (_, index) => (
                  <MyListingSkeleton key={index} />
                ))}
              </ScrollView>
            ) : (
              <>
                {draftsError && <Frown className="mx-auto size-12 color-muted-foreground" />}
                <Muted className="m-auto">
                  {draftsError
                    ? t`Oops! Something went wrong.`
                    : t`Press "Create new listing" to start selling!`}
                </Muted>
              </>
            )}
          </>
        )}
      </View>
      <View className="px-6">
        <Button disabled={isLoadingNewListing} onPress={createNewListing}>
          {isLoadingNewListing ? (
            <ActivityIndicator />
          ) : (
            <Text>
              <Trans>Create new listing</Trans>
            </Text>
          )}
        </Button>
      </View>
    </View>
  )
}
