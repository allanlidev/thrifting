import { Trans } from '@lingui/react/macro'
import { useLocalSearchParams } from 'expo-router'
import { ActivityIndicator, View, ViewProps } from 'react-native'
import { Frown } from '~/src/components/icons/Frown'
import { ListingForm } from '~/src/components/ListingForm'
import { Muted } from '~/src/components/ui/typography'
import { useListing } from '~/src/hooks/queries/listings'

const Container = (props: ViewProps) => <View className="flex-1 justify-center gap-4" {...props} />

export default function EditListing() {
  const { id } = useLocalSearchParams()
  const { data, isError, isLoading } = useListing(Number(typeof id === 'string' ? id : id[0]))

  if (isLoading) {
    return (
      <Container>
        <ActivityIndicator />
      </Container>
    )
  }

  if (isError || !data) {
    return (
      <Container>
        <Frown className="mx-auto size-12 color-muted-foreground" />
        <Muted className="mx-auto">
          <Trans>Oops! Something went wrong.</Trans>
        </Muted>
      </Container>
    )
  }

  return <ListingForm listing={data} />
}
