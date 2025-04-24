import { Image } from 'react-native'
import React, { ComponentProps, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { cssInterop } from 'nativewind'

export type RemoteImageProps = {
  bucketId: string
  path?: string
} & Omit<ComponentProps<typeof Image>, 'source'>

const StyledImage = cssInterop(Image, {
  className: 'style',
})

export function RemoteImage({ bucketId, path, ...imageProps }: RemoteImageProps) {
  const [image, setImage] = useState<string>()

  useEffect(() => {
    if (bucketId && path) downloadImage(bucketId, path)
  }, [bucketId, path])

  async function downloadImage(bucketId: string, path: string) {
    try {
      const { data, error } = await supabase.storage.from(bucketId).download(path)
      if (error) {
        throw error
      }
      const fr = new FileReader()
      fr.readAsDataURL(data)
      fr.onload = () => {
        setImage(fr.result as string)
      }
    } catch (error) {
      if (error instanceof Error) {
        console.log('Error downloading image: ', error.message)
      }
    }
  }

  return <StyledImage source={{ uri: image }} {...imageProps} />
}
