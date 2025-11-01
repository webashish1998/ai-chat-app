import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Validate environment variables and create clients
// Only throw during build if we're not in a build-safe context
if (!supabaseUrl && typeof window === 'undefined') {
  // Only throw during server-side initialization if we're in production build
  // Allow build to proceed but will fail at runtime if not set
  if (process.env.NODE_ENV === 'production' && process.env.VERCEL) {
    console.warn('NEXT_PUBLIC_SUPABASE_URL is not set')
  }
}

if (!supabaseAnonKey && typeof window === 'undefined') {
  if (process.env.NODE_ENV === 'production' && process.env.VERCEL) {
    console.warn('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set')
  }
}

// Create Supabase client - will throw error at runtime if env vars are missing
export const supabase: SupabaseClient = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (() => {
      // Return a dummy client that throws on use
      const error = new Error('Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL and/or NEXT_PUBLIC_SUPABASE_ANON_KEY')
      return new Proxy({} as SupabaseClient, {
        get() {
          throw error
        }
      }) as SupabaseClient
    })()

// For server-side operations with elevated privileges
export const supabaseAdmin: SupabaseClient = supabaseUrl
  ? createClient(
      supabaseUrl,
      process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey || ''
    )
  : (() => {
      const error = new Error('Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL')
      return new Proxy({} as SupabaseClient, {
        get() {
          throw error
        }
      }) as SupabaseClient
    })()

export default supabase
