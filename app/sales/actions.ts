'use server'

import { supabase } from '@/lib/supabase'
import { setSession, clearSession, getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'

export async function loginAction(prevState: any, formData: FormData) {
  const username = formData.get('username') as string
  const password = formData.get('password') as string

  if (!username || !password) {
    return { error: 'Username and password are required' }
  }

  // Fetch from the new artist_accounts table
  const { data: account, error } = await supabase
    .from('artist_accounts')
    .select('artist_id, username, email, password, artists(stage_name)')
    .eq('username', username)
    .single()

  console.log("LOGIN ATTEMPT", { username, account, error })

  if (error || !account) {
    console.error("Login failed, error:", error)
    return { error: 'Invalid username or password' }
  }

  // Plain text password check (as requested for rapid dev)
  if (account.password !== password) {
    return { error: 'Invalid username or password' }
  }

  // Set session cookie
  await setSession({
    artistId: account.artist_id,
    // @ts-ignore - Supabase join returns an object or array, we know it's an object here
    stageName: account.artists?.stage_name || username,
    username: account.username,
    email: account.email
  })

  redirect('/sales')
}

export async function logoutAction() {
  await clearSession()
  redirect('/sales/login')
}

export async function updateEmailAction(prevState: any, formData: FormData) {
  const session = await getSession()
  if (!session) return { error: 'Not authenticated' }

  const email = formData.get('email') as string
  if (!email) return { error: 'Email is required' }

  const { error } = await supabase
    .from('artist_accounts')
    .update({ email })
    .eq('artist_id', session.artistId)

  if (error) {
    if (error.code === '23505') return { error: 'Email is already in use' }
    return { error: 'Failed to update email' }
  }

  // Update session with new email
  await setSession({ ...session, email })
  
  return { success: 'Email updated successfully!' }
}

export async function updatePasswordAction(prevState: any, formData: FormData) {
  const session = await getSession()
  if (!session) return { error: 'Not authenticated' }

  const currentPassword = formData.get('currentPassword') as string
  const newPassword = formData.get('newPassword') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: 'All fields are required' }
  }

  if (newPassword !== confirmPassword) {
    return { error: 'New passwords do not match' }
  }

  // Verify current password
  const { data: account } = await supabase
    .from('artist_accounts')
    .select('password')
    .eq('artist_id', session.artistId)
    .single()

  if (!account || account.password !== currentPassword) {
    return { error: 'Incorrect current password' }
  }

  // Update password
  const { error } = await supabase
    .from('artist_accounts')
    .update({ password: newPassword })
    .eq('artist_id', session.artistId)

  if (error) {
    return { error: 'Failed to update password' }
  }

  return { success: 'Password updated successfully!' }
}

export async function updateUsernameAction(prevState: any, formData: FormData) {
  const session = await getSession()
  if (!session) return { error: 'Not authenticated' }

  const username = formData.get('username') as string
  if (!username) return { error: 'Username is required' }

  const { error } = await supabase
    .from('artist_accounts')
    .update({ username })
    .eq('artist_id', session.artistId)

  if (error) {
    if (error.code === '23505') return { error: 'Username is already in use' }
    return { error: 'Failed to update username' }
  }

  // Update session with new username
  await setSession({ ...session, username })
  
  return { success: 'Username updated successfully!' }
}

export async function deleteTrackAction(trackId: string, mp3FilePath?: string | null) {
  const session = await getSession()
  if (!session) return { error: 'Not authenticated' }

  try {
    // 1. Remove from Supabase Storage if file path is available
    if (mp3FilePath) {
      let bucketPath = ''
      if (mp3FilePath.includes('artist-tracks/')) {
        bucketPath = mp3FilePath.split('artist-tracks/')[1]
      } else if (mp3FilePath.startsWith('http')) {
        const parts = mp3FilePath.split('/')
        bucketPath = parts.slice(-2).join('/')
      } else {
        bucketPath = mp3FilePath
      }

      if (bucketPath) {
        const { error: storageErr } = await supabase.storage
          .from('artist-tracks')
          .remove([bucketPath])

        if (storageErr) {
          console.warn('Storage delete warning:', storageErr)
        }
      }
    }

    // 2. Delete track performance rows if present
    await supabase.from('track_performance').delete().eq('track_id', trackId)

    // 3. Delete track from database table
    const { error: dbErr } = await supabase
      .from('tracks')
      .delete()
      .eq('id', trackId)

    if (dbErr) {
      return { error: `Database delete failed: ${dbErr.message}` }
    }

    return { success: true }
  } catch (err: any) {
    console.error('Delete track action error:', err)
    return { error: err?.message || 'Failed to delete track' }
  }
}
