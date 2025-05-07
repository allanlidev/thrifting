import { useState } from 'react'
import { Alert, KeyboardAvoidingView, View } from 'react-native'
import { useAuth } from '~/src/providers/AuthProvider'
import { Button } from '~/src/components/ui/button'
import { Input } from '~/src/components/ui/input'
import { Label } from '~/src/components/ui/label'
import { Text } from '~/src/components/ui/text'
import { supabase } from '~/src/lib/supabase'
import { Trans } from '@lingui/react/macro'
import { t } from '@lingui/core/macro'

export default function Auth() {
  const { logIn } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function signInWithEmail() {
    setIsLoading(true)
    await logIn({ email, password })
    setIsLoading(false)
  }

  async function signUpWithEmail() {
    setIsLoading(true)
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
    })
    if (error) Alert.alert(error.message)
    if (!session) Alert.alert('Please check your inbox for email verification!')
    setIsLoading(false)
  }

  return (
    <KeyboardAvoidingView
      behavior="padding"
      className="flex-1 items-center justify-center gap-6 p-6"
    >
      <View className="w-full gap-2">
        <Label nativeID="emailInput">
          <Trans>Email</Trans>
        </Label>
        <Input
          onChangeText={(text) => setEmail(text)}
          value={email}
          placeholder={t`email@address.com`}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          autoCorrect={false}
          aria-labelledby="emailInput"
          aria-errormessage="emailError"
        />
      </View>
      <View className="w-full gap-2">
        <Label nativeID="passwordInput">
          <Trans>Password</Trans>
        </Label>
        <Input
          value={password}
          onChangeText={(text) => setPassword(text)}
          placeholder={t`Password`}
          autoCapitalize="none"
          autoComplete="password"
          autoCorrect={false}
          aria-labelledby="passwordInput"
          aria-errormessage="passwordError"
          secureTextEntry
        />
      </View>
      <View className="w-full gap-4">
        <Button disabled={isLoading} onPress={() => signInWithEmail()} className="self-stretch">
          <Text>
            <Trans>Sign in</Trans>
          </Text>
        </Button>
        <Button
          disabled={isLoading}
          onPress={() => signUpWithEmail()}
          variant="secondary"
          className="self-stretch"
        >
          <Text>
            <Trans>Create account</Trans>
          </Text>
        </Button>
      </View>
    </KeyboardAvoidingView>
  )
}
