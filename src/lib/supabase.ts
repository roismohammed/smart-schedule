import { createClient } from '@supabase/supabase-js'

const rawUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim()
const rawKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim()

const isValidUrl = (url: string) => {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

export const isSupabaseConfigured = Boolean(
  rawUrl &&
  rawKey &&
  isValidUrl(rawUrl) &&
  !rawUrl.includes('xyzcompany') &&
  !rawUrl.includes('your-project-id')
)

const safeUrl = isSupabaseConfigured ? rawUrl : 'https://xyzcompany.supabase.co'
const safeKey = isSupabaseConfigured ? rawKey : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy'

export const supabase = createClient(safeUrl, safeKey)
