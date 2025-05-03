import { Image } from 'react-native'
import React, { ComponentProps } from 'react'
import { supabase } from '~/lib/supabase'
import { cssInterop } from 'nativewind'
import { useQuery } from '@tanstack/react-query'
import { Skeleton } from '~/components/ui/skeleton'
import { convertBlobToBase64 } from '~/lib/utils'

export type RemoteImageProps = {
  bucketId: string
  path?: string
} & Omit<ComponentProps<typeof Image>, 'source'>

const StyledImage = cssInterop(Image, {
  className: 'style',
})

async function downloadImage(bucketId: string, path: string) {
  try {
    const { data, error } = await supabase.storage.from(bucketId).download(path)
    if (error) {
      throw error
    }
    return convertBlobToBase64(data)
  } catch (error) {
    if (error instanceof Error) {
      console.log('Error downloading image: ', error.message)
    }
  }
}

export function RemoteImage({ bucketId, path, ...imageProps }: RemoteImageProps) {
  const {
    data: image,
    error,
    isLoading,
  } = useQuery({
    queryKey: ['remoteImage', bucketId, path],
    queryFn: () => downloadImage(bucketId, path!),
    enabled: !!path,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: false,
  })

  if (isLoading) {
    return <Skeleton {...imageProps} />
  }

  if (error) {
    return null
  }

  return <StyledImage source={{ uri: image }} {...imageProps} />
}
