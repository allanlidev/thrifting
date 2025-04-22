import { ScrollView } from 'react-native'
import { H1 } from '~/components/ui/typography'

export default function Home() {
  return (
    <ScrollView className="flex-1 px-6 pt-6">
      <H1 className="text-center">welcome to thrifting</H1>
    </ScrollView>
  )
}
