import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/utils/supabase'

// GET /api/chat-rooms/[id] - Get chat room by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { data: chatRoom, error } = await supabase
      .from('chat_rooms')
      .select(`
        *,
        created_by_user:users!chat_rooms_created_by_fkey(username, avatar_url),
        members:chat_room_members(
          user_id,
          role,
          joined_at,
          user:users(id, username, avatar_url)
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (!chatRoom) {
      return NextResponse.json({ error: 'Chat room not found' }, { status: 404 })
    }

    return NextResponse.json({ chatRoom })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/chat-rooms/[id] - Update chat room
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    const { data: chatRoom, error } = await supabase
      .from('chat_rooms')
      .update(body)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ chatRoom })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/chat-rooms/[id] - Delete chat room
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { error } = await supabase
      .from('chat_rooms')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ message: 'Chat room deleted successfully' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
