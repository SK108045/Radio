'use client'

import { useState } from 'react'
import Image, { type ImageProps } from 'next/image'

export default function FallbackImage({
  src,
  fallbackSrc = '/KarteloandMiracleBaby.jpg',
  onError,
  ...props
}: ImageProps & { fallbackSrc?: string }) {
  const [failedSource, setFailedSource] = useState<ImageProps['src'] | null>(null)

  return (
    <Image
      {...props}
      src={failedSource === src ? fallbackSrc : src}
      onError={event => {
        setFailedSource(src)
        onError?.(event)
      }}
    />
  )
}
