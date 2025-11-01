import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/utils/supabase'

// PUT /api/chat-rooms/[id]/members/[userId] - Update member role
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const { id, userId } = await params
    const body = await request.json()
    
    const { data: member, error } = await supabase
      .from('chat_room_members')
      .update(body)
      .eq('chat_room_id', id)
      .eq('user_id', userId)
      .select(`
        *,
        user:users(id, username, avatar_url, email)
      `)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ member })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/chat-rooms/[id]/members/[userId] - Remove member from chat room
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const { id, userId } = await params
    const { error } = await supabase
      .from('chat_room_members')
      .delete()
      .eq('chat_room_id', id)
      .eq('user_id', userId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ message: 'Member removed successfully' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
