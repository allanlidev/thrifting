import { useState, useEffect } from 'react'
import { View, Alert, KeyboardAvoidingView } from 'react-native'
import { Button } from '~/components/ui/button'
import { Label } from '~/components/ui/label'
import { Input } from '~/components/ui/input'
import { Text } from '~/components/ui/text'
import { supabase } from '~/lib/supabase'
import { useSession } from '~/components/SessionProvider'

export default function Profile() {
  const { session, logOut } = useSession()

  const [isLoading, setIsLoading] = useState(true)
  const [username, setUsername] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')

  useEffect(() => {
    async function getProfile() {
      if (!session) return
      try {
        setIsLoading(true)

        const { data, error, status } = await supabase
          .from('profiles')
          .select(`username, avatar_url`)
          .eq('id', session.user.id)
          .single()
        if (error && status !== 406) {
          throw error
        }

        if (data) {
          setUsername(data.username)
          setAvatarUrl(data.avatar_url)
        }
      } catch (error) {
        if (error instanceof Error) {
          Alert.alert(error.message)
        }
      } finally {
        setIsLoading(false)
      }
    }

    getProfile()
  }, [session])

  async function updateProfile({ username, avatar_url }: { username: string; avatar_url: string }) {
    if (!session) return
    try {
      setIsLoading(true)
      const updates = {
        id: session.user.id,
        username,
        avatar_url,
        updated_at: new Date(),
      }

      const { error } = await supabase.from('profiles').upsert(updates)

      if (error) {
        throw error
      }
      Alert.alert('Profile updated!')
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (!session) return null

  return (
    <KeyboardAvoidingView
      behavior="padding"
      className="flex-1 items-center justify-center gap-6 p-6"
    >
      <View className="w-full gap-2">
        <Label nativeID="emailInput">Email</Label>
        <Input value={session.user.email} aria-labelledby="emailInput" aria-disabled />
      </View>
      <View className="w-full gap-2">
        <Label nativeID="usernameInput">User name</Label>
        <Input
          value={username}
          editable={!isLoading}
          onChangeText={(text) => setUsername(text)}
          aria-labelledby="usernameInput"
          aria-disabled={isLoading}
        />
      </View>
      <Button
        onPress={() => updateProfile({ username, avatar_url: avatarUrl })}
        disabled={isLoading}
        className="self-stretch"
      >
        <Text>{isLoading ? 'Loading ...' : 'Update'}</Text>
      </Button>
      <Button onPress={logOut} variant="destructive" className="self-stretch">
        <Text>Sign out</Text>
      </Button>
    </KeyboardAvoidingView>
  )
}
