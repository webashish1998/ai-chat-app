import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/utils/supabase'
import { InsertUser } from '@/types/database'

// GET /api/users - Get all users
export async function GET() {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase error in GET /api/users:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Error in GET /api/users:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { error: errorMessage, details: process.env.NODE_ENV === 'development' ? String(error) : undefined },
      { status: 500 }
    )
  }
}

// POST /api/users - Create a new user
export async function POST(request: NextRequest) {
  try {
    const body: InsertUser = await request.json()
    
    const { data: user, error } = await supabase
      .from('users')
      .insert([body])
      .select()
      .single()

    if (error) {
      console.error('Supabase error in POST /api/users:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/users:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { error: errorMessage, details: process.env.NODE_ENV === 'development' ? String(error) : undefined },
      { status: 500 }
    )
  }
}
