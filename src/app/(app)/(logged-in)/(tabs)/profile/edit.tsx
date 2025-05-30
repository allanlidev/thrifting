import { useState, useRef } from 'react'
import {
  View,
  Alert,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from 'react-native'
import { Button } from '~/src/components/ui/button'
import { Label } from '~/src/components/ui/label'
import { Input } from '~/src/components/ui/input'
import { Text } from '~/src/components/ui/text'
import { supabase } from '~/src/lib/supabase'
import { useAuth } from '~/src/providers/AuthProvider'
import { Avatar, AvatarFallback, AvatarImage } from '~/src/components/ui/avatar'
import { Camera } from '~/src/components/icons/Camera'
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet'
import { Images } from '~/src/components/icons/Images'
import { Trash } from '~/src/components/icons/Trash'
import { useColorScheme } from '~/src/hooks/useColorScheme'
import * as ImagePicker from 'expo-image-picker'
import { useUpdateProfile } from '~/src/hooks/queries/profiles'
import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'

export default function Profile() {
  const { session, profile } = useAuth()
  const { isDarkColorScheme } = useColorScheme()

  const { error, isPending, isSuccess, mutate: updateProfile } = useUpdateProfile()

  const [username, setUsername] = useState(profile?.username ?? undefined)
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? undefined)

  const bottomSheetRef = useRef<BottomSheet>(null)

  // Open the bottom sheet when the avatar is pressed
  function handleAvatarPress() {
    bottomSheetRef.current?.expand()
  }

  // Close the bottom sheet
  function closeBottomSheet() {
    bottomSheetRef.current?.close()
  }

  if (!session || !profile) return null

  /**
   * Opens the image picker to select an image from the camera or library.
   * It uploads the selected image to Supabase storage and updates the avatar URL.
   * @param mode - The mode of image selection, either 'camera' or 'library'.
   * @throws If there is an error during image selection or upload.
   */
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
        Alert.alert(t`Oops! Something went wrong.`)
      }
    }
  }

  // Show an alert if there is an error or if the profile update is successful
  // This is a side effect that runs after the mutation completes
  if (error) {
    Alert.alert(t`Oops! Something went wrong.`)
  } else if (isSuccess) {
    Alert.alert(t`Profile updated!`)
  }

  return (
    <KeyboardAvoidingView behavior="padding" className="flex-1">
      <ScrollView
        contentContainerClassName="pt-safe-offset-4 flex-1 items-center gap-6 p-6"
        automaticallyAdjustKeyboardInsets
      >
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
          <Label nativeID="usernameInput">
            <Trans>User name</Trans>
          </Label>
          <Input
            value={username}
            editable={!isPending}
            onChangeText={(text) => setUsername(text)}
            aria-labelledby="usernameInput"
            aria-disabled={isPending}
          />
        </View>
        <Button
          onPress={() =>
            updateProfile({
              id: profile.id,
              updates: { username, avatar_url: avatarUrl },
            })
          }
          disabled={isPending}
          className="flex-row items-center gap-2 self-stretch"
        >
          {isPending && <ActivityIndicator />}
          <Text>{isPending ? t`Loading...` : t`Update`}</Text>
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
                <Text>
                  <Trans>Upload from Camera</Trans>
                </Text>
                <Camera className="color-primary" />
              </Button>
              <Button
                variant="secondary"
                className="flex-1 flex-row justify-between"
                onPress={() => pickImage({ mode: 'library' })}
              >
                <Text>
                  <Trans>Upload from Library</Trans>
                </Text>
                <Images className="color-primary" />
              </Button>
              {avatarUrl && (
                <Button variant="destructive" className="flex-1 flex-row justify-between">
                  <Text>
                    <Trans>Remove avatar</Trans>
                  </Text>
                  <Trash className="color-primary" />
                </Button>
              )}
              <Button variant="ghost" onPress={closeBottomSheet}>
                <Text>
                  <Trans>Cancel</Trans>
                </Text>
              </Button>
            </View>
          </BottomSheetScrollView>
        </BottomSheet>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
