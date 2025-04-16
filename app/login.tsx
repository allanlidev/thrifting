import { Redirect } from 'expo-router'
import { useState } from 'react'
import { Alert, KeyboardAvoidingView, View } from 'react-native'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Text } from '~/components/ui/text'
import { supabase } from '~/lib/supabase'
import useSession from '~/lib/useSession'

export default function Auth() {
  const { session } = useSession()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  if (session?.user) return <Redirect href="/account" />

  async function signInWithEmail() {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    })
    if (error) Alert.alert(error.message)
    setLoading(false)
  }

  async function signUpWithEmail() {
    setLoading(true)
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
    })
    if (error) Alert.alert(error.message)
    if (!session) Alert.alert('Please check your inbox for email verification!')
    setLoading(false)
  }

  return (
    <KeyboardAvoidingView
      behavior="padding"
      className="flex-1 items-center justify-center gap-6 p-6"
    >
      <View className="w-full gap-2">
        <Label nativeID="emailInput">Email</Label>
        <Input
          onChangeText={(text) => setEmail(text)}
          value={email}
          placeholder="email@address.com"
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          autoCorrect={false}
          aria-labelledby="emailInput"
          aria-errormessage="emailError"
        />
      </View>
      <View className="w-full gap-2">
        <Label nativeID="passwordInput">Password</Label>
        <Input
          value={password}
          onChangeText={(text) => setPassword(text)}
          placeholder="Password"
          autoCapitalize="none"
          autoComplete="password"
          autoCorrect={false}
          aria-labelledby="passwordInput"
          aria-errormessage="passwordError"
          secureTextEntry
        />
      </View>
      <View className="w-full gap-4">
        <Button disabled={loading} onPress={() => signInWithEmail()} className="self-stretch">
          <Text>Sign in</Text>
        </Button>
        <Button
          disabled={loading}
          onPress={() => signUpWithEmail()}
          variant="secondary"
          className="self-stretch"
        >
          <Text>Sign up</Text>
        </Button>
      </View>
    </KeyboardAvoidingView>
  )
}
