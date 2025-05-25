import { Trans } from '@lingui/react/macro'
import { View } from 'react-native'
import { ButtonGroup } from '~/src/components/ButtonGroup'
import { H1 } from '~/src/components/ui/typography'
import { RadioGroup } from '~/src/components/ui/radio-group'
import { AppLanguage, useLanguagePreference } from '~/src/providers/LanguagePreferenceProvider'
import RadioGroupButton from '~/src/components/RadioGroupButton'

const LANGUAGES = [
  { label: 'English', value: AppLanguage.en },
  { label: 'Suomi', value: AppLanguage.fi },
]

export default function SettingsLanguage() {
  const { preferredLanguage, setPreferredLanguage } = useLanguagePreference()

  async function handleValueChange(value: string) {
    await setPreferredLanguage(value as AppLanguage)
  }

  return (
    <View className="pb-safe-offset-2 flex-1 gap-4 p-6">
      <H1>
        <Trans>App Language</Trans>
      </H1>
      <RadioGroup value={preferredLanguage} onValueChange={handleValueChange}>
        <ButtonGroup>
          {LANGUAGES.map((lang) => (
            <RadioGroupButton
              key={lang.value}
              value={lang.value}
              label={lang.label}
              size="lg"
              variant="outline"
            />
          ))}
        </ButtonGroup>
      </RadioGroup>
    </View>
  )
}
