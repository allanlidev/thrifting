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
  const { session, profile, logOut } = useAuth()
  const { isDarkColorScheme } = useColorScheme()

  const { error, isPending, isSuccess, mutate: updateProfile } = useUpdateProfile()

  const [fullName, setFullName] = useState(profile?.full_name ?? undefined)
  const [username, setUsername] = useState(profile?.username ?? undefined)
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? undefined)
  const [isDeleting, setIsDeleting] = useState(false)

  const isLoading = isPending || isDeleting

  const bottomSheetRef = useRef<BottomSheet>(null)

  function handleAvatarPress() {
    bottomSheetRef.current?.expand()
  }

  function closeBottomSheet() {
    bottomSheetRef.current?.close()
  }

  if (!session || !profile) return null

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

  if (error) {
    Alert.alert(t`Oops! Something went wrong.`)
  } else if (isSuccess) {
    Alert.alert(t`Profile updated!`)
  }

  function handleDeleteAccount() {
    Alert.alert(
      'Delete account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: deleteAccount,
        },
      ]
    )
  }

  async function deleteAccount() {
    try {
      setIsDeleting(true)
      if (!session?.user) throw new Error('No user')
      await supabase.functions.invoke('user-self-deletion')
      alert('Account deleted successfully!')
    } catch (error) {
      alert('Error deleting the account!')
      console.log(error)
    } finally {
      setIsDeleting(false)
      // Note that you also will force a logout after completing it
      logOut()
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
          <Label nativeID="fullNameInput">
            <Trans>Full name</Trans>
          </Label>
          <Input
            value={fullName}
            onChangeText={(name) => setFullName(name)}
            aria-labelledby="fullNameInput"
            aria-disabled
          />
        </View>
        <View className="w-full gap-2">
          <Label nativeID="emailInput">
            <Trans>Email</Trans>
          </Label>
          <Input value={session.user.email} aria-labelledby="emailInput" aria-disabled />
        </View>
        <View className="w-full gap-2">
          <Label nativeID="usernameInput">
            <Trans>User name</Trans>
          </Label>
          <Input
            value={username}
            editable={!isLoading}
            onChangeText={(text) => setUsername(text)}
            aria-labelledby="usernameInput"
            aria-disabled={isLoading}
          />
        </View>
        <Button
          onPress={() =>
            updateProfile({
              id: profile.id,
              updates: { full_name: fullName, username, avatar_url: avatarUrl },
            })
          }
          disabled={isLoading}
          className="flex-row items-center gap-2 self-stretch"
        >
          {isPending && <ActivityIndicator />}
          <Text>{isPending ? t`Loading...` : t`Update`}</Text>
        </Button>
        <Button
          variant="destructive"
          onPress={handleDeleteAccount}
          disabled={isLoading}
          className="flex-row items-center gap-2 self-stretch"
        >
          {isDeleting && <ActivityIndicator className="color-foreground" />}
          <Text>{isDeleting ? <Trans>Deleting...</Trans> : <Trans>Delete account</Trans>}</Text>
        </Button>
        <Button
          onPress={logOut}
          variant="destructive"
          disabled={isLoading}
          className="self-stretch"
        >
          <Text>
            <Trans>Sign out</Trans>
          </Text>
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
