'use client'
import { Upload, type PreviousUpload } from 'tus-js-client'
export type UploadGrant = { trackId: string; path: string; token: string; endpoint: string; contentType: string; uploaded?: boolean }
export function createAudioUpload(file: File, grant: UploadGrant, progress: (value: number) => void, success: () => void, error: (error: Error) => void) {
  return new Upload(file, {
    endpoint: grant.endpoint, chunkSize: 6 * 1024 * 1024,
    retryDelays: [0, 1000, 3000, 5000, 10000, 20000],
    headers: { 'x-signature': grant.token, apikey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY! },
    uploadDataDuringCreation: true, removeFingerprintOnSuccess: true,
    // Include the server-owned object path; never resume into another artist's upload.
    fingerprint: async () => `rieng:${grant.path}:${file.name}:${file.size}:${file.lastModified}`,
    metadata: { bucketName: 'artist-tracks', objectName: grant.path, contentType: grant.contentType, cacheControl: '0' },
    onProgress: (sent, total) => progress(Math.round(sent / total * 100)),
    onSuccess: success, onError: error,
  })
}
export async function startOrResume(upload: Upload) {
  const previous: PreviousUpload[] = await upload.findPreviousUploads()
  if (previous.length) upload.resumeFromPreviousUpload(previous[0])
  upload.start()
}
