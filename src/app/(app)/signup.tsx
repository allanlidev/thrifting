import { ActivityIndicator, Alert, KeyboardAvoidingView, ScrollView, View } from 'react-native'
import { Button } from '~/src/components/ui/button'
import { Input } from '~/src/components/ui/input'
import { Label } from '~/src/components/ui/label'
import { Text } from '~/src/components/ui/text'
import { supabase } from '~/src/lib/supabase'
import { Trans } from '@lingui/react/macro'
import { t } from '@lingui/core/macro'
import { H1 } from '~/src/components/ui/typography'
import { z } from 'zod'
import { passwordSchema } from '~/src/lib/schema'
import { useForm } from '@tanstack/react-form'
import { ErrorMessage } from '~/src/components/ErrorMessage'

export default function Signup() {
  const formSchema = z.object({
    email: z.string().email({ message: t`Invalid email address` }),
    password: passwordSchema,
  })

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    validators: { onSubmit: formSchema },
    onSubmit: async ({ value }) => {
      const { email, password } = value
      await signUpWithEmail({ email, password })
    },
  })

  /**
   * Sign up with email and password.
   * This function uses Supabase to create a new user account.
   * It sets the loading state while the request is being processed,
   * and displays an alert with the result of the operation.
   */
  async function signUpWithEmail({ email, password }: { email: string; password: string }) {
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({ email, password })
    if (error) Alert.alert(error.message)
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
            <form.Field
              name="email"
              children={(field) => (
                <>
                  <Input
                    onChangeText={field.handleChange}
                    value={field.state.value}
                    placeholder={t`email@address.com`}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoComplete="email"
                    autoCorrect={false}
                    aria-labelledby="emailInput"
                    aria-errormessage="emailError"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <ErrorMessage
                      msg={field.state.meta.errors.map((error) => error?.message).join(', ')}
                    />
                  )}
                </>
              )}
            />
          </View>
          <View className="w-full gap-2">
            <Label nativeID="passwordInput">
              <Trans>Password</Trans>
            </Label>
            <form.Field
              name="password"
              children={(field) => (
                <>
                  <Input
                    value={field.state.value}
                    onChangeText={field.handleChange}
                    placeholder={t`Password`}
                    autoCapitalize="none"
                    autoComplete="password"
                    autoCorrect={false}
                    aria-labelledby="passwordInput"
                    aria-errormessage="passwordError"
                    secureTextEntry
                  />
                  {field.state.meta.errors.length > 0 && (
                    <ErrorMessage
                      msg={field.state.meta.errors.map((error) => error?.message)[0] as string}
                    />
                  )}
                </>
              )}
            />
          </View>
          <form.Subscribe
            children={({ isSubmitting }) => (
              <Button
                disabled={isSubmitting}
                onPress={form.handleSubmit}
                className="flex-row gap-2 self-stretch"
              >
                {isSubmitting && <ActivityIndicator />}
                <Text>
                  {isSubmitting ? <Trans>Registering...</Trans> : <Trans>Register</Trans>}
                </Text>
              </Button>
            )}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
