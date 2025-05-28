import { t } from '@lingui/core/macro'
import { Trans, useLingui } from '@lingui/react/macro'
import { useLocales } from 'expo-localization'
import { useLocalSearchParams } from 'expo-router'
import {
  RefreshControl,
  ScrollView,
  ScrollViewProps,
  useWindowDimensions,
  View,
} from 'react-native'
import { useSharedValue } from 'react-native-reanimated'
import Carousel from 'react-native-reanimated-carousel'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Frown } from '~/src/components/icons/Frown'
import { PaginationBasic } from '~/src/components/Pagination'
import { RemoteImage } from '~/src/components/RemoteImage'
import { Badge } from '~/src/components/ui/badge'
import { Button } from '~/src/components/ui/button'
import { Skeleton } from '~/src/components/ui/skeleton'
import { Text } from '~/src/components/ui/text'
import { H1, H2, Large, Muted, P } from '~/src/components/ui/typography'
import { useListing } from '~/src/hooks/queries/listings'
import { useProfile } from '~/src/hooks/queries/profiles'
import { category } from '~/src/lib/productCategory'
import { cn } from '~/src/lib/utils'

const Container = ({ contentContainerClassName, ...rest }: ScrollViewProps) => {
  return (
    <ScrollView contentContainerClassName={cn('gap-6 pb-8', contentContainerClassName)} {...rest} />
  )
}

export default function Listing() {
  const { height, width } = useWindowDimensions()
  const { top: safeAreaTop } = useSafeAreaInsets()
  const { i18n, t } = useLingui()
  const { id } = useLocalSearchParams()
  const {
    data: listing,
    isLoadingError: isLoadingErrorListing,
    isLoading: isLoadingListing,
    refetch: refetchListing,
    isRefetching: isRefetchingListing,
  } = useListing(Number(id))
  const {
    data: profile,
    isLoadingError: isLoadingErrorProfile,
    isLoading: isLoadingProfile,
    refetch: refetchProfile,
    isRefetching: isRefetchingProfile,
  } = useProfile(listing?.user_id)

  const isLoading = isLoadingListing || isLoadingProfile
  const isLoadingError = isLoadingErrorListing || isLoadingErrorProfile
  const isRefetching = isRefetchingListing || isRefetchingProfile
  const refetch = () => {
    refetchListing()
    refetchProfile()
  }

  const progress = useSharedValue(0)

  if (isLoading) {
    return (
      <Container>
        <Skeleton className="h-[55vh] w-full" />
        <View className="mx-6 flex-1 gap-6">
          <View className="gap-3">
            <Skeleton className="h-8 w-2/5" />
            <Skeleton className="h-10 w-3/5" />
          </View>
          <Skeleton className="h-9 w-1/3" />
          <View className="h-14 flex-row gap-4">
            <Skeleton className="flex-1" />
          </View>
          <View className="flex-1 gap-2">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-4/5" />
          </View>
        </View>
      </Container>
    )
  }

  if (isLoadingError || !listing || !profile) {
    return (
      <Container
        contentContainerClassName="pt-safe-offset-6 items-center justify-center"
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            progressViewOffset={safeAreaTop}
          />
        }
      >
        <Frown className="size-12 color-muted-foreground" />
        <Muted>
          <Trans>Oops! Something went wrong.</Trans>
        </Muted>
      </Container>
    )
  }

  return (
    <Container
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          progressViewOffset={safeAreaTop}
        />
      }
    >
      <View className="relative">
        <Carousel
          width={width}
          height={height * 0.55}
          data={listing.images}
          loop={listing.images.length > 1}
          onProgressChange={progress}
          renderItem={({ index, item }) => (
            <RemoteImage
              bucketId="product-images"
              path={item}
              accessibilityLabel={t`Image ${index + 1} for listing`}
              className="h-full w-full"
            />
          )}
        />
        <PaginationBasic
          progress={progress}
          data={listing.images}
          containerClassName="absolute bottom-4 gap-2"
          activeDotClassName="bg-primary rounded-full overflow-hidden"
          dotClassName="bg-muted rounded-full"
        />
      </View>
      <View className="mx-6 flex-1 gap-6">
        <View className="gap-3">
          <H2 className="border-0 text-2xl">{profile.username}</H2>
          <H1 numberOfLines={2}>{listing.title}</H1>
          <Badge variant="secondary" className="self-start">
            <Text>{t(category[listing.category])}</Text>
          </Badge>
        </View>
        <Large className="text-3xl font-semibold">
          {listing.price.toLocaleString(i18n.locale, {
            style: 'currency',
            currency: 'EUR',
          })}
        </Large>
        <View className="flex-row gap-4">
          <Button size="lg" className="flex-1">
            <Text>
              <Trans>Buy now</Trans>
            </Text>
          </Button>
        </View>
        <P>{listing.description}</P>
      </View>
    </Container>
  )
}
