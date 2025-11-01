import { NextResponse } from 'next/server'

// Health check endpoint to verify environment variables
export async function GET() {
  const envCheck = {
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasSupabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    hasOpenAIKey: !!process.env.OPENAI_API_KEY,
    hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
    hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
    nodeEnv: process.env.NODE_ENV,
    isVercel: !!process.env.VERCEL,
    // Show first few characters of URL for verification (safe)
    supabaseUrlPreview: process.env.NEXT_PUBLIC_SUPABASE_URL
      ? `${process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 20)}...`
      : 'NOT SET',
  }

  const allRequiredSet =
    envCheck.hasSupabaseUrl &&
    envCheck.hasSupabaseAnonKey

  return NextResponse.json({
    status: allRequiredSet ? 'healthy' : 'unhealthy',
    message: allRequiredSet
      ? 'All required environment variables are set'
      : 'Some required environment variables are missing',
    environment: envCheck,
    required: {
      NEXT_PUBLIC_SUPABASE_URL: envCheck.hasSupabaseUrl ? 'SET' : 'MISSING',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: envCheck.hasSupabaseAnonKey ? 'SET' : 'MISSING',
    },
    optional: {
      SUPABASE_SERVICE_ROLE_KEY: envCheck.hasServiceRoleKey ? 'SET' : 'NOT SET (optional)',
      OPENAI_API_KEY: envCheck.hasOpenAIKey ? 'SET' : 'NOT SET (optional)',
      NEXTAUTH_SECRET: envCheck.hasNextAuthSecret ? 'SET' : 'NOT SET (optional)',
      NEXTAUTH_URL: envCheck.hasNextAuthUrl ? 'SET' : 'NOT SET (optional)',
    },
  })
}

