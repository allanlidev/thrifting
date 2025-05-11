import { Trans } from '@lingui/react/macro'
import { useLocalSearchParams } from 'expo-router'
import { useMemo } from 'react'
import { ActivityIndicator, KeyboardAvoidingView, ScrollView, View } from 'react-native'
import { Frown } from '~/src/components/icons/Frown'
import { ListingForm } from '~/src/components/ListingForm'
import { Muted } from '~/src/components/ui/typography'
import { useDraftListings } from '~/src/hooks/queries/listings'

export default function EditListing() {
  const { id } = useLocalSearchParams()
  const { data: drafts, isFetching: isDraftsFetching } = useDraftListings()

  const listingId = useMemo(() => {
    const parsedId = typeof id === 'string' ? parseInt(id) : null
    return Number.isInteger(parsedId) ? parsedId : null
  }, [id])

  const listing = useMemo(() => {
    if (listingId == null) return null
    return drafts?.find((draft) => draft.id === listingId)
  }, [listingId])

  return (
    <>
      {listing && !isDraftsFetching ? (
        <KeyboardAvoidingView behavior="padding" className="flex-1">
          <ScrollView>
            <ListingForm listing={listing} />
          </ScrollView>
        </KeyboardAvoidingView>
      ) : (
        <View className="flex-1 justify-center gap-4">
          {isDraftsFetching ? (
            <ActivityIndicator />
          ) : (
            <>
              <Frown className="mx-auto size-12 color-muted-foreground" />
              <Muted className="mx-auto">
                <Trans>Could not find listing</Trans>
              </Muted>
            </>
          )}
        </View>
      )}
    </>
  )
}
