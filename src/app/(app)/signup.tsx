import { useState } from 'react'
import { ActivityIndicator, Alert, KeyboardAvoidingView, ScrollView, View } from 'react-native'
import { Button } from '~/src/components/ui/button'
import { Input } from '~/src/components/ui/input'
import { Label } from '~/src/components/ui/label'
import { Text } from '~/src/components/ui/text'
import { supabase } from '~/src/lib/supabase'
import { Trans } from '@lingui/react/macro'
import { t } from '@lingui/core/macro'
import { H1 } from '~/src/components/ui/typography'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  /**
   * Sign up with email and password.
   * This function uses Supabase to create a new user account.
   * It sets the loading state while the request is being processed,
   * and displays an alert with the result of the operation.
   */
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
    setIsLoading(false)
    if (session) {
      Alert.alert("You've successfully registered! Happy thrifting!")
    }
  }

  return (
    <KeyboardAvoidingView behavior="padding" className="flex-1">
      <ScrollView
        className="pb-safe-offset-2 p-6"
        contentContainerClassName="flex-1 gap-12"
        automaticallyAdjustKeyboardInsets
      >
        <H1 className="text-center">
          <Trans>Register account</Trans>
        </H1>
        <View className="gap-6">
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
          <Button
            disabled={isLoading}
            onPress={() => signUpWithEmail()}
            className="flex-row gap-2 self-stretch"
          >
            {isLoading && <ActivityIndicator />}
            <Text>{isLoading ? <Trans>Registering...</Trans> : <Trans>Register</Trans>}</Text>
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
