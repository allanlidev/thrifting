import { useState, useRef } from 'react'
import { View, Alert, KeyboardAvoidingView, Pressable, ScrollView } from 'react-native'
import { Button } from '~/components/ui/button'
import { Label } from '~/components/ui/label'
import { Input } from '~/components/ui/input'
import { Text } from '~/components/ui/text'
import { supabase } from '~/lib/supabase'
import { useAuth } from '~/providers/AuthProvider'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { Camera } from '~/lib/icons/Camera'
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet'
import { Images } from '~/lib/icons/Images'
import { Trash } from '~/lib/icons/Trash'
import { useColorScheme } from '~/lib/useColorScheme'
import * as ImagePicker from 'expo-image-picker'
import { type TablesUpdate } from '~/database.types'

export default function Profile() {
  const { session, profile, logOut } = useAuth()
  const { isDarkColorScheme } = useColorScheme()

  const [isUpdating, setIsUpdating] = useState(false)
  const [fullName, setFullName] = useState<string>(profile?.full_name)
  const [username, setUsername] = useState<string>(profile?.username)
  const [avatarUrl, setAvatarUrl] = useState<string>(profile?.avatar_url)

  const bottomSheetRef = useRef<BottomSheet>(null)

  async function updateProfile({ full_name, username, avatar_url }: TablesUpdate<'profiles'>) {
    if (!session || (!full_name && !username && !avatar_url)) return
    try {
      setIsUpdating(true)
      const updates: TablesUpdate<'profiles'> = {
        id: session.user.id,
        full_name,
        username,
        avatar_url,
        updated_at: new Date().toISOString(),
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
      setIsUpdating(false)
    }
  }

  function handleAvatarPress() {
    bottomSheetRef.current?.expand()
  }

  function closeBottomSheet() {
    bottomSheetRef.current?.close()
  }

  if (!session) return null

  async function pickImage({ mode }: { mode: 'camera' | 'library' }) {
    const imagePickerOptions: ImagePicker.ImagePickerOptions = {
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
      exif: false,
    }

    try {
      const result =
        mode === 'camera'
          ? await ImagePicker.launchCameraAsync(imagePickerOptions)
          : await ImagePicker.launchImageLibraryAsync(imagePickerOptions)

      if (result.canceled) return

      const asset = result.assets[0]

      const arraybuffer = await fetch(asset.uri).then((res) => res.arrayBuffer())

      const fileExt = asset.uri.split('.').pop()?.toLowerCase() ?? 'jpeg'
      const path = `${Date.now()}.${fileExt}`
      const { data, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, arraybuffer, {
          contentType: asset.mimeType ?? 'image/jpeg',
        })

      if (uploadError) {
        throw uploadError
      }

      setAvatarUrl(data.path)
      closeBottomSheet()
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message)
      }
    }
  }

  return (
    <KeyboardAvoidingView behavior="padding" className="flex-1">
      <ScrollView contentContainerClassName="pt-safe-offset-4 flex-1 items-center gap-6 p-6">
        <Pressable className="relative p-2 active:opacity-80" onPress={handleAvatarPress}>
          <Avatar
            alt={avatarUrl ? 'Your profile image' : 'Add your profile image'}
            className="size-24 rounded-full"
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
            editable={!isUpdating}
            onChangeText={(text) => setUsername(text)}
            aria-labelledby="usernameInput"
            aria-disabled={isUpdating}
          />
        </View>
        <Button
          onPress={() => updateProfile({ full_name: fullName, username, avatar_url: avatarUrl })}
          disabled={isUpdating}
          className="self-stretch"
        >
          <Text>{isUpdating ? 'Loading ...' : 'Update'}</Text>
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
          backdropComponent={(props) => (
            <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} />
          )}
        >
          <BottomSheetScrollView scrollEnabled={false} className="flex-1">
            <View className="pb-safe flex-1 gap-4 p-4">
              <Button
                variant="secondary"
                className="flex-1 flex-row justify-between"
                onPress={() => pickImage({ mode: 'camera' })}
              >
                <Text>Upload from Camera</Text>
                <Camera className="color-primary" />
              </Button>
              <Button
                variant="secondary"
                className="flex-1 flex-row justify-between"
                onPress={() => pickImage({ mode: 'library' })}
              >
                <Text>Upload from Library</Text>
                <Images className="color-primary" />
              </Button>
              {avatarUrl && (
                <Button variant="destructive" className="flex-1 flex-row justify-between">
                  <Text>Remove avatar</Text>
                  <Trash className="color-primary" />
                </Button>
              )}
              <Button variant="ghost" onPress={closeBottomSheet}>
                <Text>Cancel</Text>
              </Button>
            </View>
          </BottomSheetScrollView>
        </BottomSheet>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
