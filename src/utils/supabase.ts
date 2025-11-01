import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Cache clients to avoid recreating them
let _supabase: SupabaseClient | null = null
let _supabaseAdmin: SupabaseClient | null = null

// Get environment variables at runtime (not at module load time)
function getEnvVars() {
  return {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  }
}

// Create Supabase client - checks env vars at runtime
function getSupabaseClient(): SupabaseClient {
  if (_supabase) {
    return _supabase
  }

  const { supabaseUrl, supabaseAnonKey } = getEnvVars()

  if (!supabaseUrl) {
    throw new Error(
      'Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL. ' +
      'Please set it in Vercel project settings under Environment Variables.'
    )
  }

  if (!supabaseAnonKey) {
    throw new Error(
      'Missing required environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY. ' +
      'Please set it in Vercel project settings under Environment Variables.'
    )
  }

  _supabase = createClient(supabaseUrl, supabaseAnonKey)
  return _supabase
}

// For server-side operations with elevated privileges
function getSupabaseAdminClient(): SupabaseClient {
  if (_supabaseAdmin) {
    return _supabaseAdmin
  }

  const { supabaseUrl, supabaseAnonKey, serviceRoleKey } = getEnvVars()

  if (!supabaseUrl) {
    throw new Error(
      'Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL. ' +
      'Please set it in Vercel project settings under Environment Variables.'
    )
  }

  _supabaseAdmin = createClient(
    supabaseUrl,
    serviceRoleKey || supabaseAnonKey || ''
  )
  return _supabaseAdmin
}

// Export Supabase client with lazy initialization
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseClient()
    const value = (client as any)[prop]
    if (typeof value === 'function') {
      return value.bind(client)
    }
    return value
  },
  has(_target, prop) {
    const client = getSupabaseClient()
    return prop in client
  }
}) as SupabaseClient

// Export admin client with lazy initialization
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseAdminClient()
    const value = (client as any)[prop]
    if (typeof value === 'function') {
      return value.bind(client)
    }
    return value
  },
  has(_target, prop) {
    const client = getSupabaseAdminClient()
    return prop in client
  }
}) as SupabaseClient

export default supabase
