import { useEffect, useState } from 'react'
import { ScrollView, View, ActivityIndicator } from 'react-native'
import { MyListing, MyListingSkeleton } from '~/components/MyListing'
import { Button } from '~/components/ui/button'
import { Skeleton } from '~/components/ui/skeleton'
import { Text } from '~/components/ui/text'
import { Muted } from '~/components/ui/typography'
import { supabase } from '~/lib/supabase'

export default function Sell() {
  const [drafts, setDrafts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchDrafts = async () => {
      let { data, error } = await supabase.from('products').select('*').eq('published', false)

      if (error) {
        throw error
      }

      data && setDrafts(data)
      setTimeout(() => setIsLoading(false), 500)
    }

    try {
      setIsLoading(true)
      fetchDrafts()
    } catch (error) {
      console.error(error)
      setTimeout(() => setIsLoading(false), 500)
    }
  }, [])

  return (
    <View className="flex-1 gap-6 p-6">
      <View className="flex-1 overflow-hidden rounded-md border border-solid border-border px-4">
        {drafts.length > 0 && !isLoading ? (
          <ScrollView>
            <View className="pb-4">
              {drafts.map((listing) => (
                <MyListing key={listing.id} item={listing} />
              ))}
            </View>
          </ScrollView>
        ) : (
          <>
            {isLoading ? (
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
      <Button>
        <Text>Create new listing</Text>
      </Button>
    </View>
  )
}
