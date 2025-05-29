import { ActivityIndicator, KeyboardAvoidingView, ScrollView, View } from 'react-native'
import { useAuth } from '~/src/providers/AuthProvider'
import { Button } from '~/src/components/ui/button'
import { Input } from '~/src/components/ui/input'
import { Label } from '~/src/components/ui/label'
import { Text } from '~/src/components/ui/text'
import { Trans } from '@lingui/react/macro'
import { t } from '@lingui/core/macro'
import { H1 } from '~/src/components/ui/typography'
import { z } from 'zod'
import { useForm } from '@tanstack/react-form'
import { ErrorMessage } from '~/src/components/ErrorMessage'

export default function Login() {
  const { logIn } = useAuth()

  const formSchema = z.object({
    email: z.string().email({ message: t`Invalid email address` }),
    password: z.string(),
  })

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    validators: { onSubmit: formSchema },
    onSubmit: async ({ value }) => {
      const { email, password } = value
      await logIn({ email, password })
    },
  })

  return (
    <KeyboardAvoidingView behavior="padding" className="flex-1">
      <ScrollView
        className="pb-safe-offset-2 p-6"
        contentContainerClassName="flex-1 gap-12"
        automaticallyAdjustKeyboardInsets
      >
        <H1 className="text-center">
          <Trans>Sign in</Trans>
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
                <Text>{isSubmitting ? <Trans>Signing in...</Trans> : <Trans>Sign in</Trans>}</Text>
              </Button>
            )}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
