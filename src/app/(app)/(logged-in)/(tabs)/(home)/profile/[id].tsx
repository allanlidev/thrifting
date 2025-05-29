import { useLocalSearchParams } from 'expo-router'
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  type ScrollViewProps,
  View,
  ViewProps,
} from 'react-native'
import { Avatar, AvatarFallback, AvatarImage } from '~/src/components/ui/avatar'
import { H1, H2, Large, Muted } from '~/src/components/ui/typography'
import { Trans } from '@lingui/react/macro'
import { useProfile } from '~/src/hooks/queries/profiles'
import { useListings } from '~/src/hooks/queries/listings'
import { cn } from '~/src/lib/utils'
import { Skeleton } from '~/src/components/ui/skeleton'
import { FlashList } from '@shopify/flash-list'
import { Listing, ListingSkeleton } from '~/src/components/Listing'
import { useCallback } from 'react'
import { Frown } from '~/src/components/icons/Frown'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const Container = ({ contentContainerClassName, ...props }: ScrollViewProps) => (
  <ScrollView
    contentContainerClassName={cn(['pt-safe-offset-6 flex-1 ', contentContainerClassName])}
    {...props}
  />
)

const HeaderContainer = ({ className, ...props }: ViewProps) => (
  <View className={cn('mb-6 gap-6 px-6', className)} {...props} />
)

const HeaderSkeleton = () => (
  <HeaderContainer>
    <View className="relative h-52">
      <Skeleton className="absolute bottom-0 left-0 size-32 rounded-full" />
    </View>
    <View className="gap-2">
      <Skeleton className="h-10 w-3/5" />
      <Skeleton className="h-7 w-2/5" />
    </View>
    <Skeleton className="h-8 w-28" />
  </HeaderContainer>
)

export default function Profile() {
  const { id } = useLocalSearchParams()
  const {
    data: profile,
    isLoadingError: isLoadingErrorProfile,
    isLoading: isLoadingProfile,
    refetch: refetchProfile,
    isRefetching: isRefetchingProfile,
  } = useProfile(id as string)
  const {
    data: listingsData,
    isLoadingError: isLoadingErrorListings,
    isLoading: isLoadingListings,
    refetch: refetchListings,
    isRefetching: isRefetchingListings,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useListings({
    userId: id as string,
    status: 'published',
  })

  const { top: safeAreaTop } = useSafeAreaInsets()

  const listings = listingsData?.pages?.flat() ?? []

  const isLoading = isLoadingProfile || isLoadingListings
  const isRefetching = isRefetchingProfile || isRefetchingListings

  const avatarUrl = profile?.avatar_url
  const username = profile?.username
  const fullName = profile?.full_name

  function refetch() {
    refetchProfile()
    refetchListings()
  }

  const getListingMargin = useCallback(
    (index: number) => (index % 2 === 0 ? 'ml-6 mr-3' : 'ml-3 mr-6'),
    []
  )

  const Header = useCallback(
    ({ className, ...rest }: ViewProps) => {
      return (
        <HeaderContainer className={className} {...rest}>
          <View className="relative h-52">
            <Avatar
              alt={avatarUrl ? 'Your profile image' : 'Add your profile image'}
              className="absolute bottom-0 left-0 size-32 rounded-full"
            >
              {avatarUrl ? (
                <AvatarImage
                  bucketId="avatars"
                  path={avatarUrl}
                  accessibilityLabel="Your profile image"
                />
              ) : (
                <AvatarFallback />
              )}
            </Avatar>
          </View>
          <View className="gap-2">
            <H1>{username}</H1>
            <Large>{fullName}</Large>
          </View>
          <H2>
            <Trans>Listings</Trans>
          </H2>
        </HeaderContainer>
      )
    },
    [avatarUrl, fullName, username]
  )

  if (isLoading) {
    return (
      <FlashList
        data={Array(4)}
        renderItem={({ index }) => (
          <View className={cn('mb-6 flex-1 items-center', getListingMargin(index))}>
            <ListingSkeleton />
          </View>
        )}
        estimatedItemSize={180}
        numColumns={2}
        ListHeaderComponent={HeaderSkeleton}
        contentContainerClassName="pt-safe-offset-6"
      />
    )
  }

  if (isLoadingErrorProfile) {
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
        <View className="flex-1 items-center justify-center gap-3">
          <Frown className="size-12 color-muted-foreground" />
          <Muted>
            <Trans>Oops! Something went wrong.</Trans>
          </Muted>
        </View>
      </Container>
    )
  }

  if (isLoadingErrorListings) {
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
        <Header />
        <View className="mt-6 items-center justify-start gap-3">
          <Frown className="size-12 color-muted-foreground" />
          <Muted>
            <Trans>No listings found.</Trans>
          </Muted>
        </View>
      </Container>
    )
  }

  return (
    <FlashList
      data={listings}
      renderItem={({ item, index }) => (
        <View className={cn('mb-6 flex-1 items-center', getListingMargin(index))}>
          <Listing item={item} href={{ pathname: '/listing/[id]', params: { id: item.id } }} />
        </View>
      )}
      estimatedItemSize={180}
      numColumns={2}
      ListHeaderComponent={Header}
      ListFooterComponent={() => isFetchingNextPage && <ActivityIndicator className="m-4" />}
      onEndReached={() => {
        hasNextPage && fetchNextPage()
      }}
      refreshing={isRefetching}
      onRefresh={refetch}
      progressViewOffset={safeAreaTop}
      contentContainerClassName="pt-safe-offset-6 pb-8"
    />
  )
}
