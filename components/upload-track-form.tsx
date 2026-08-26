'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Upload, X, Check, AlertCircle, Loader2, Music, Sparkles } from 'lucide-react'
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
  const [enhancing, setEnhancing] = useState(false)
  const [enhancedBadge, setEnhancedBadge] = useState(false)

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

  // ── AI Enhance Description with Gemini 3.1 Flash Lite ──
  const handleAIEnhance = async () => {
    if (!formData.trackName.trim()) {
      setError('Please enter a Track Name first before enhancing with Gemini AI')
      return
    }

    setEnhancing(true)
    setError('')

    try {
      const res = await fetch('/api/ai/enhance-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.trackName.trim(),
          rawDescription: formData.description.trim(),
        }),
      })

      const data = await res.json()
      if (data.enhancedDescription) {
        setFormData((prev) => ({ ...prev, description: data.enhancedDescription }))
        setEnhancedBadge(true)
        setTimeout(() => setEnhancedBadge(false), 4000)
      } else {
        setError('Could not generate AI description. You can keep typing manually.')
      }
    } catch (err) {
      console.error('AI enhance client error:', err)
      setError('AI service temporarily unreachable.')
    } finally {
      setEnhancing(false)
    }
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
      // Determine target artist ID
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

      // Auto-enhance description with Gemini if very short (< 15 chars)
      let finalDescription = formData.description.trim()
      if (!finalDescription || finalDescription.length < 15) {
        setUploadProgress('Polishing description with Gemini AI ✨…')
        try {
          const aiRes = await fetch('/api/ai/enhance-description', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: formData.trackName.trim(),
              rawDescription: finalDescription,
            }),
          })
          const aiData = await aiRes.json()
          if (aiData.enhancedDescription) {
            finalDescription = aiData.enhancedDescription
          }
        } catch {
          // Fallback to manual if offline
        }
      }

      // 1. Upload audio to Supabase Storage
      setUploadProgress('Uploading audio file to Supabase storage…')
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
      setUploadProgress('Registering track in catalog…')
      const { error: insertErr } = await supabase.from('tracks').insert({
        artist_id: targetArtistId,
        title: formData.trackName.trim(),
        description: finalDescription || null,
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
    <Card className="bg-card border-border mb-6 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="w-5 h-5 text-primary" />
          Upload New Track
        </CardTitle>
        <CardDescription>Add a new track to your catalog with Gemini AI description polishing</CardDescription>
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
            <span className="text-sm text-primary">Track uploaded successfully! Registered in Other Artists Store.</span>
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
                disabled={uploading || enhancing}
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
                disabled={uploading || enhancing}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="description" className="block text-sm font-medium text-foreground">
                Description
              </label>
              <div className="flex items-center gap-2">
                {enhancedBadge && (
                  <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                    <Check className="w-3 h-3" /> Polished with Gemini
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleAIEnhance}
                  disabled={enhancing || uploading || !formData.trackName.trim()}
                  className="inline-flex items-center gap-1.5 text-xs font-bold bg-primary/10 hover:bg-primary text-primary hover:text-white border border-primary/30 px-3 py-1 rounded-full transition-all duration-300 disabled:opacity-50"
                  title="Enhance notes with Gemini 3.1 Flash Lite"
                >
                  {enhancing ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Enhancing…
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3" />
                      AI Enhance with Gemini ✨
                    </>
                  )}
                </button>
              </div>
            </div>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe your track, mood, vibe, features… (or click AI Enhance ✨ to generate automatically)"
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
            disabled={uploading || enhancing}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold py-6 text-sm"
          >
            {uploading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                {uploadProgress || 'Uploading…'}
              </span>
            ) : (
              'Upload Track & Sync to Store'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
