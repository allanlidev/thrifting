import { useFocusEffect, useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
import { ActivityIndicator, ScrollView, View } from 'react-native'
import Toast from 'react-native-toast-message'
import { MyListing, MyListingSkeleton } from '~/components/MyListing'
import { Button } from '~/components/ui/button'
import { Text } from '~/components/ui/text'
import { Muted } from '~/components/ui/typography'
import { supabase } from '~/lib/supabase'

export default function Sell() {
  const router = useRouter()

  const [drafts, setDrafts] = useState<any[]>([])
  const [isLoadingDrafts, setIsLoadingDrafts] = useState(false)
  const [isLoadingNewListing, setIsLoadingNewListing] = useState(false)

  useFocusEffect(
    useCallback(() => {
      fetchDrafts()
    }, [])
  )

  const fetchDrafts = async () => {
    setIsLoadingDrafts(true)

    let { data, error } = await supabase.from('products').select('*').eq('published', false)

    setTimeout(() => setIsLoadingDrafts(false), 500)

    if (error) {
      console.error(error)
      Toast.show({
        type: 'error',
        text1: 'Error getting drafts',
        text2: error.message,
      })
      return
    }

    data && setDrafts(data)
  }

  const createNewListing = async () => {
    setIsLoadingNewListing(true)

    const { data, error } = await supabase.from('products').insert([{}]).select()

    setIsLoadingNewListing(false)

    if (error) {
      console.error(error)
      Toast.show({
        type: 'error',
        text1: 'Error creating a new listing',
        text2: error.message,
      })
      return
    }

    router.push({ pathname: '/sell/edit/[id]', params: { id: data[0].id } })
  }

  return (
    <View className="flex-1 gap-6 p-6">
      <View className="flex-1 overflow-hidden rounded-md border border-solid border-border px-4">
        {drafts.length > 0 && !isLoadingDrafts ? (
          <ScrollView>
            <View className="pb-4">
              {drafts.map((listing) => (
                <MyListing
                  key={listing.id}
                  item={listing}
                  onPress={() => {
                    router.push({ pathname: '/sell/edit/[id]', params: { id: listing.id } })
                  }}
                />
              ))}
            </View>
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
              <Muted className="m-auto">Press "Create new listing" to start selling!</Muted>
            )}
          </>
        )}
      </View>
      <Button onPress={createNewListing}>
        {isLoadingNewListing ? <ActivityIndicator /> : <Text>Create new listing</Text>}
      </Button>
    </View>
  )
}
