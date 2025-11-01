import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/utils/supabase'
import { InsertChatRoomMember } from '@/types/database'

// GET /api/chat-rooms/[id]/members - Get members of a chat room
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { data: members, error } = await supabase
      .from('chat_room_members')
      .select(`
        *,
        user:users(id, username, avatar_url, email)
      `)
      .eq('chat_room_id', id)
      .order('joined_at', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ members })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/chat-rooms/[id]/members - Add a member to chat room
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body: Omit<InsertChatRoomMember, 'chat_room_id'> = await request.json()
    
    const memberData: InsertChatRoomMember = {
      ...body,
      chat_room_id: id
    }

    const { data: member, error } = await supabase
      .from('chat_room_members')
      .insert([memberData])
      .select(`
        *,
        user:users(id, username, avatar_url, email)
      `)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ member }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
