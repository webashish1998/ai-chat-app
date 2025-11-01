import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Lazy initialization - only validate and create client when actually used
let _supabase: SupabaseClient | null = null
let _supabaseAdmin: SupabaseClient | null = null

function getSupabaseClient(): SupabaseClient {
  if (_supabase) {
    return _supabase
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl) {
    throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL')
  }

  if (!supabaseAnonKey) {
    throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }

  _supabase = createClient(supabaseUrl, supabaseAnonKey)
  return _supabase
}

function getSupabaseAdminClient(): SupabaseClient {
  if (_supabaseAdmin) {
    return _supabaseAdmin
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl) {
    throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL')
  }

  _supabaseAdmin = createClient(
    supabaseUrl,
    serviceRoleKey || supabaseAnonKey || ''
  )
  return _supabaseAdmin
}

// Export with lazy initialization - client is only created when first accessed
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseClient()
    const value = (client as any)[prop]
    // If it's a method, bind it to the client
    if (typeof value === 'function') {
      return value.bind(client)
    }
    return value
  }
}) as SupabaseClient

// For server-side operations with elevated privileges
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseAdminClient()
    const value = (client as any)[prop]
    // If it's a method, bind it to the client
    if (typeof value === 'function') {
      return value.bind(client)
    }
    return value
  }
}) as SupabaseClient

export default supabase
