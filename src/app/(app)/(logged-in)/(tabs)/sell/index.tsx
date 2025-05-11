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
        text1: t`Error creating a new listing`,
        text2: error.message,
      })
      return
    }

    queryClient.invalidateQueries({ queryKey: ['listings', 'drafts'] })
    router.push({ pathname: '/sell/edit/[id]', params: { id: data[0].id } })
  }

  return (
    <View className="flex-1 gap-6 p-6">
      <View className="flex-1 overflow-hidden rounded-md border border-solid border-border px-4">
        {drafts && drafts.length > 0 && !isLoadingDrafts ? (
          <ScrollView contentContainerClassName="pb-4">
            {drafts.map((listing) => (
              <MyListing
                key={listing.id}
                item={listing}
                onPress={() => {
                  router.push({ pathname: '/sell/edit/[id]', params: { id: listing.id } })
                }}
              />
            ))}
          </ScrollView>
        ) : (
          <>
            {isLoadingDrafts ? (
              <View>
                {Array.from({ length: 6 }, (_, index) => (
                  <MyListingSkeleton key={index} />
                ))}
              </View>
            ) : (
              <>
                {draftsError && <Frown className="mx-auto size-12 color-muted-foreground" />}
                <Muted className="m-auto">
                  {draftsError
                    ? t`Could not get drafts`
                    : t`Press "Create new listing" to start selling!`}
                </Muted>
              </>
            )}
          </>
        )}
      </View>
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
  )
}
