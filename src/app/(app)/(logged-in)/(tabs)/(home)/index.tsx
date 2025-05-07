import { Trans } from '@lingui/react/macro'
import { ScrollView } from 'react-native'
import { H1 } from '~/src/components/ui/typography'

export default function Home() {
  return (
    <ScrollView className="pt-safe-offset-6 flex-1 px-6">
      <H1 className="text-center">
        <Trans>welcome to thrifting</Trans>
      </H1>
    </ScrollView>
  )
}
