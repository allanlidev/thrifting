import { useState, useEffect, useRef, useCallback, JSX } from 'react'
import { View, Alert, KeyboardAvoidingView, Pressable, ScrollView } from 'react-native'
import { Button } from '~/components/ui/button'
import { Label } from '~/components/ui/label'
import { Input } from '~/components/ui/input'
import { Text } from '~/components/ui/text'
import { supabase } from '~/lib/supabase'
import { useSession } from '~/components/SessionProvider'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { Camera } from '~/lib/icons/Camera'
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet'
import { Images } from '~/lib/icons/Images'
import { Trash } from '~/lib/icons/Trash'
import { useColorScheme } from '~/lib/useColorScheme'
import { BottomSheetDefaultBackdropProps } from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheetBackdrop/types'

export default function Profile() {
  const { session, logOut } = useSession()
  const { isDarkColorScheme } = useColorScheme()

  const [isLoading, setIsLoading] = useState(true)
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')

  const bottomSheetRef = useRef<BottomSheet>(null)

  useEffect(() => {
    async function getProfile() {
      if (!session) return
      try {
        setIsLoading(true)

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
      } finally {
        setIsLoading(false)
      }
    }

    getProfile()
  }, [session])

  async function updateProfile({
    full_name,
    username,
    avatar_url,
  }: {
    full_name: string
    username: string
    avatar_url: string
  }) {
    if (!session) return
    try {
      setIsLoading(true)
      const updates = {
        id: session.user.id,
        full_name,
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

  const renderBackdrop = useCallback(
    (props: JSX.IntrinsicAttributes & BottomSheetDefaultBackdropProps) => (
      <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} />
    ),
    []
  )

  if (!session) return null

  function handleAvatarPress() {
    bottomSheetRef.current?.expand()
  }

  return (
    <KeyboardAvoidingView behavior="padding" className="flex-1">
      <ScrollView contentContainerClassName="pt-safe-offset-4 flex-1 items-center gap-6 p-6">
        <Pressable className="relative p-2 active:opacity-80" onPress={handleAvatarPress}>
          <Avatar
            alt={avatarUrl ? 'Your profile image' : 'Add your profile image'}
            className="size-24 rounded-full"
          >
            <AvatarImage source={{ uri: avatarUrl }} accessibilityLabel="Your profile image" />
            <AvatarFallback />
          </Avatar>
          <View className="absolute bottom-0 right-0 flex size-10 items-center justify-center rounded-full border-2 border-background bg-muted">
            <Camera className="size-5 color-foreground" />
          </View>
        </Pressable>
        <View className="w-full gap-2">
          <Label nativeID="fullNameInput">Full name</Label>
          <Input
            value={fullName}
            onChangeText={(name) => setFullName(name)}
            aria-labelledby="fullNameInput"
            aria-disabled
          />
        </View>
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
          onPress={() => updateProfile({ full_name: fullName, username, avatar_url: avatarUrl })}
          disabled={isLoading}
          className="self-stretch"
        >
          <Text>{isLoading ? 'Loading ...' : 'Update'}</Text>
        </Button>
        <Button onPress={logOut} variant="destructive" className="self-stretch">
          <Text>Sign out</Text>
        </Button>
        <BottomSheet
          ref={bottomSheetRef}
          enablePanDownToClose
          index={-1}
          backgroundStyle={{ backgroundColor: isDarkColorScheme ? 'black' : 'white' }}
          handleIndicatorStyle={{
            backgroundColor: isDarkColorScheme ? 'white' : 'black',
          }}
          backdropComponent={renderBackdrop}
        >
          <BottomSheetView className="pb-safe flex-1 gap-4 p-4">
            <Button variant="secondary" className="flex-1 flex-row justify-between">
              <Text>Upload from Camera</Text>
              <Camera className="color-primary" />
            </Button>
            <Button variant="secondary" className="flex-1 flex-row justify-between">
              <Text>Upload from Library</Text>
              <Images className="color-primary" />
            </Button>
            {avatarUrl && (
              <Button variant="destructive" className="flex-1 flex-row justify-between">
                <Text>Remove avatar</Text>
                <Trash />
              </Button>
            )}
            <Button variant="ghost" onPress={() => bottomSheetRef.current?.close()}>
              <Text>Cancel</Text>
            </Button>
          </BottomSheetView>
        </BottomSheet>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
