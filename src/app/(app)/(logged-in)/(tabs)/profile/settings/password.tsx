import { ScrollView } from 'react-native'
import { H1 } from '~/src/components/ui/typography'

export default function SettingsAccountPassword() {
  return (
    <ScrollView
      className="pb-safe-offset-2 p-6"
      contentContainerClassName="flex-1 gap-7"
      automaticallyAdjustKeyboardInsets
    >
      <H1>Password</H1>
    </ScrollView>
  )
}
