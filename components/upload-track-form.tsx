'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Upload, X, Check, AlertCircle, Loader2, Music } from 'lucide-react'
import { supabase, STORAGE_BUCKET } from '@/lib/supabase'

interface UploadTrackFormProps {
  artistId?: string
}

export function UploadTrackForm({ artistId }: UploadTrackFormProps = {}) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [formData, setFormData] = useState({
    trackName: '',
    description: '',
    price: '',
    mp3File: null as File | null,
  })
  const [fileName, setFileName] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate size (50MB max)
    const maxSizeBytes = 50 * 1024 * 1024
    if (file.size > maxSizeBytes) {
      setError('File is too large. Maximum allowed file size is 50MB.')
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    // Validate audio format
    const nameLower = file.name.toLowerCase()
    const isAudio = 
      file.type.startsWith('audio/') ||
      file.type === 'application/octet-stream' ||
      nameLower.endsWith('.mp3') ||
      nameLower.endsWith('.wav') ||
      nameLower.endsWith('.m4a') ||
      nameLower.endsWith('.aac') ||
      nameLower.endsWith('.ogg')

    if (!isAudio) {
      setError('Please select a valid audio file (.mp3, .wav, .m4a)')
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    setFormData((prev) => ({ ...prev, mp3File: file }))
    setFileName(file.name)
    setError('')
  }

  const handleClearFile = () => {
    setFormData((prev) => ({ ...prev, mp3File: null }))
    setFileName('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.trackName.trim()) {
      setError('Please enter a track name')
      return
    }
    if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      setError('Please enter a valid price in KSh (e.g. 150 or 300)')
      return
    }
    if (!formData.mp3File) {
      setError('Please select an audio file to upload')
      return
    }

    setUploading(true)
    setError('')
    setSuccess(false)

    try {
      // Determine valid artist ID (use passed artistId or fallback to querying artists table)
      let targetArtistId = artistId

      if (!targetArtistId) {
        const { data: defaultArtist, error: artistErr } = await supabase
          .from('artists')
          .select('id')
          .limit(1)
          .single()

        if (artistErr || !defaultArtist) {
          throw new Error('Artist profile not found. Please log in again to upload.')
        }
        targetArtistId = defaultArtist.id
      }

      // 1. Upload audio to Supabase Storage
      setUploadProgress('Uploading audio file to storage…')
      const ext = formData.mp3File.name.split('.').pop()?.toLowerCase() || 'mp3'
      const randomSuffix = Math.random().toString(36).substring(2, 8)
      const cleanFileName = `${Date.now()}-${randomSuffix}.${ext}`
      const filePath = `${targetArtistId}/${cleanFileName}`

      const contentType = formData.mp3File.type || (ext === 'mp3' ? 'audio/mpeg' : 'audio/mp3')

      const { error: uploadErr } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, formData.mp3File, {
          contentType,
          upsert: true,
        })

      if (uploadErr) {
        throw new Error(`Storage upload failed: ${uploadErr.message}`)
      }

      // 2. Retrieve public URL
      const { data: urlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath)
      const publicAudioUrl = urlData.publicUrl

      // 3. Insert track into DB
      setUploadProgress('Saving track details to database…')
      const { error: insertErr } = await supabase.from('tracks').insert({
        artist_id: targetArtistId,
        title: formData.trackName.trim(),
        description: formData.description.trim() || null,
        price_ksh: Number(formData.price),
        mp3_file_path: publicAudioUrl,
      })

      if (insertErr) {
        throw new Error(`Database error: ${insertErr.message}`)
      }

      // 4. Success handling & Reset form
      setSuccess(true)
      setFormData({ trackName: '', description: '', price: '', mp3File: null })
      setFileName('')
      if (fileInputRef.current) fileInputRef.current.value = ''
      setUploadProgress('')
      
      router.refresh()
      setTimeout(() => setSuccess(false), 5000)
    } catch (err: unknown) {
      console.error('Track upload error:', err)
      setError(err instanceof Error ? err.message : 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
      setUploadProgress('')
    }
  }

  return (
    <Card className="bg-card border-border mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="w-5 h-5 text-primary" />
          Upload New Track
        </CardTitle>
        <CardDescription>Add a new track to your catalog — stored securely in Supabase</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/30 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
            <span className="text-sm text-destructive">{error}</span>
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-primary/10 border border-primary/30 rounded-lg flex items-center gap-2">
            <Check className="w-5 h-5 text-primary" />
            <span className="text-sm text-primary">Track uploaded successfully! Dashboard updated.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="trackName" className="block text-sm font-medium text-foreground">
                Track Name *
              </label>
              <Input
                id="trackName"
                name="trackName"
                placeholder="e.g., Midnight Cipher"
                value={formData.trackName}
                onChange={handleInputChange}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                disabled={uploading}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="price" className="block text-sm font-medium text-foreground">
                Price (KSh) *
              </label>
              <Input
                id="price"
                name="price"
                type="number"
                min="1"
                placeholder="e.g., 150 or 300"
                value={formData.price}
                onChange={handleInputChange}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                disabled={uploading}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium text-foreground">
              Description (Optional)
            </label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe your track, mood, genre, features…"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="bg-input border-border text-foreground placeholder:text-muted-foreground resize-none"
              disabled={uploading}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">Audio File (MP3 / WAV) *</label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".mp3,.wav,.m4a,audio/*"
              onChange={handleFileChange}
              className="hidden"
              id="mp3-upload"
              disabled={uploading}
            />
            {!fileName ? (
              <label
                htmlFor="mp3-upload"
                className="flex items-center justify-center w-full px-4 py-8 border-2 border-dashed border-primary/40 rounded-lg bg-primary/5 hover:bg-primary/10 cursor-pointer transition-colors duration-200"
              >
                <div className="text-center">
                  <Upload className="w-8 h-8 text-primary mx-auto mb-2" />
                  <p className="text-sm font-medium text-foreground">Click to upload Audio File</p>
                  <p className="text-xs text-muted-foreground mt-1">MP3, WAV, M4A up to 50 MB</p>
                </div>
              </label>
            ) : (
              <div className="flex items-center justify-between p-3 bg-primary/10 border border-primary/30 rounded-lg">
                <div className="flex items-center gap-2 min-w-0">
                  <Music className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-sm text-foreground font-medium truncate">{fileName}</span>
                </div>
                <button
                  type="button"
                  onClick={handleClearFile}
                  disabled={uploading}
                  className="text-muted-foreground hover:text-foreground disabled:opacity-40 ml-2"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <Button
            type="submit"
            disabled={uploading}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold py-6"
          >
            {uploading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                {uploadProgress || 'Uploading…'}
              </span>
            ) : (
              'Upload Track'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
