import { Link } from 'expo-router'
import { useState, useEffect } from 'react'
import { Alert, ScrollView, View } from 'react-native'
import { useAuth } from '~/providers/AuthProvider'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { Button } from '~/components/ui/button'
import { Text } from '~/components/ui/text'
import { H1, Large } from '~/components/ui/typography'
import { supabase } from '~/lib/supabase'

export default function ProfileIndex() {
  const { session } = useAuth()

  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')

  useEffect(() => {
    async function getProfile() {
      if (!session) return
      try {
        const { data, error, status } = await supabase
          .from('profiles')
          .select(`full_name, username, avatar_url`)
          .eq('id', session.user.id)
          .single()
        if (error && status !== 406) {
          throw error
        }

        if (data) {
          setFullName(data.full_name)
          setUsername(data.username)
          setAvatarUrl(data.avatar_url)
        }
      } catch (error) {
        if (error instanceof Error) {
          Alert.alert(error.message)
        }
      }
    }

    getProfile()
  }, [session])

  return (
    <ScrollView className="pt-safe-offset-6 flex-1 p-6" contentContainerClassName="gap-6">
      <View className="flex-1 flex-row items-end justify-between">
        <Avatar
          alt={avatarUrl ? 'Your profile image' : 'Add your profile image'}
          className="size-32 rounded-full"
        >
          {avatarUrl ? (
            <AvatarImage
              bucketId="avatars"
              path={avatarUrl}
              accessibilityLabel="Your profile image"
            />
          ) : (
            <AvatarFallback />
          )}
        </Avatar>
        <View>
          <Link href="/profile/edit" asChild>
            <Button variant="secondary" className="rounded-full">
              <Text>Edit profile</Text>
            </Button>
          </Link>
        </View>
      </View>
      <View className="flex-1 justify-center gap-2">
        <H1>{username}</H1>
        <Large>{fullName}</Large>
      </View>
    </ScrollView>
  )
}
