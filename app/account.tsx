import { useState, useEffect } from 'react'
import { View, Alert, KeyboardAvoidingView } from 'react-native'
import { Button } from '~/components/ui/button'
import { H1 } from '~/components/ui/typography'
import { Label } from '~/components/ui/label'
import { Input } from '~/components/ui/input'
import { Text } from '~/components/ui/text'
import { supabase } from '~/lib/supabase'
import useSession from '~/lib/useSession'

export default function Account() {
  const { session } = useSession()

  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')

  useEffect(() => {
    async function getProfile() {
      try {
        setLoading(true)
        if (!session?.user) throw new Error('No user on the session!')

        const { data, error, status } = await supabase
          .from('profiles')
          .select(`username, avatar_url`)
          .eq('id', session?.user.id)
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
        setLoading(false)
      }
    }

    if (session) getProfile()
  }, [session])

  if (!session?.user) {
    return (
      <View className="flex-1 p-6">
        <H1 className="mt-10 text-center">Sign in to view your account details</H1>
      </View>
    )
  }

  async function updateProfile({ username, avatar_url }: { username: string; avatar_url: string }) {
    try {
      setLoading(true)
      if (!session?.user) throw new Error('No user on the session!')

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
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      behavior="padding"
      className="flex-1 items-center justify-center gap-6 p-6"
    >
      <View className="w-full gap-2">
        <Label nativeID="emailInput">Email</Label>
        <Input value={session?.user?.email} aria-labelledby="emailInput" aria-disabled />
      </View>
      <View className="w-full gap-2">
        <Label nativeID="usernameInput">User name</Label>
        <Input
          value={username}
          onChangeText={(text) => setUsername(text)}
          aria-labelledby="usernameInput"
        />
      </View>
      <Button
        onPress={() => updateProfile({ username, avatar_url: avatarUrl })}
        disabled={loading}
        className="self-stretch"
      >
        <Text>{loading ? 'Loading ...' : 'Update'}</Text>
      </Button>
      <Button
        onPress={() => supabase.auth.signOut()}
        variant="destructive"
        className="self-stretch"
      >
        <Text>Sign out</Text>
      </Button>
    </KeyboardAvoidingView>
  )
}
