import { Trans } from '@lingui/react/macro'
import { useForm } from '@tanstack/react-form'
import { ActivityIndicator, Alert, ScrollView, View } from 'react-native'
import { ErrorMessage } from '~/src/components/ErrorMessage'
import { Button } from '~/src/components/ui/button'
import { Input } from '~/src/components/ui/input'
import { Label } from '~/src/components/ui/label'
import { H1 } from '~/src/components/ui/typography'
import { Text } from '~/src/components/ui/text'
import { z } from 'zod'
import { supabase } from '~/src/lib/supabase'
import { AuthError } from '@supabase/supabase-js'
import { t } from '@lingui/core/macro'
import { passwordSchema } from '~/src/lib/schema'
import { useRouter } from 'expo-router'

export default function SettingsAccountPassword() {
  const router = useRouter()

  const formSchema = z
    .object({
      password: passwordSchema,
      confirm: passwordSchema,
    })
    .refine((data) => data.password === data.confirm, {
      message: t`Passwords don't match`,
      path: ['confirm'],
    })

  const form = useForm({
    defaultValues: {
      password: '',
      confirm: '',
    },
    validators: { onSubmit: formSchema },
    onSubmit: async ({ value }) => {
      // Handle password change logic here
      try {
        const { error } = await supabase.auth.updateUser({ password: value.password })
        if (error) throw error
        Alert.alert(t`Your password has been successfully changed!`, undefined, [
          {
            text: t`OK`,
            onPress: () => {
              router.back()
            },
          },
        ])
      } catch (error) {
        if (error instanceof AuthError) {
          console.error('Error changing password:', error.message)
          Alert.alert(t`Error changing password`, error.message)
        } else {
          console.error('Error changing password:', error)
          Alert.alert(t`Error changing password`)
        }
      }
    },
  })

  return (
    <ScrollView
      className="pb-safe-offset-2 p-6"
      contentContainerClassName="flex-1 gap-7"
      automaticallyAdjustKeyboardInsets
    >
      <H1>Change password</H1>
      <form.Field name="password">
        {(field) => (
          <View className="w-full gap-2">
            <Label nativeID="passwordInput">
              <Trans>Password</Trans>
            </Label>
            <Input
              value={field.state.value}
              onChangeText={field.handleChange}
              autoCapitalize="none"
              autoCorrect={false}
              aria-labelledby="passwordInput"
              aria-errormessage="passwordError"
              secureTextEntry
            />
          </View>
        )}
      </form.Field>
      <form.Field name="confirm">
        {(field) => (
          <View className="w-full gap-2">
            <Label nativeID="confirmPasswordInput">
              <Trans>Confirm password</Trans>
            </Label>
            <Input
              value={field.state.value}
              onChangeText={field.handleChange}
              autoCapitalize="none"
              autoCorrect={false}
              aria-labelledby="confirmPasswordInput"
              aria-errormessage="passwordError"
              secureTextEntry
            />
            {field.state.meta.errors.length > 0 && (
              <ErrorMessage
                msg={field.state.meta.errors.map((error) => error?.message)[0] as string}
              />
            )}
          </View>
        )}
      </form.Field>
      <form.Subscribe
        children={({ isDirty, isSubmitting }) => (
          <Button disabled={!isDirty || isSubmitting} onPress={form.handleSubmit}>
            {isSubmitting ? (
              <ActivityIndicator />
            ) : (
              <Text>
                <Trans>Change password</Trans>
              </Text>
            )}
          </Button>
        )}
      />
    </ScrollView>
  )
}
