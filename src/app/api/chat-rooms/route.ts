import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/utils/supabase'
import { InsertChatRoom } from '@/types/database'

// GET /api/chat-rooms - Get all chat rooms
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    let query = supabase
      .from('chat_rooms')
      .select(`
        *,
        created_by_user:users!chat_rooms_created_by_fkey(username, avatar_url),
        members:chat_room_members(
          user_id,
          role,
          user:users(username, avatar_url)
        ),
        _count:messages(count)
      `)

    // If userId is provided, filter rooms where user is a member
    if (userId) {
      const { data: memberRooms } = await supabase
        .from('chat_room_members')
        .select('chat_room_id')
        .eq('user_id', userId)
      
      const roomIds = memberRooms?.map(m => m.chat_room_id) || []
      if (roomIds.length > 0) {
        query = query.in('id', roomIds)
      } else {
        // User is not a member of any rooms
        return NextResponse.json({ chatRooms: [] })
      }
    }

    const { data: chatRooms, error } = await query.order('updated_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ chatRooms })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/chat-rooms - Create a new chat room
export async function POST(request: NextRequest) {
  try {
    const body: InsertChatRoom = await request.json()
    
    const { data: chatRoom, error } = await supabase
      .from('chat_rooms')
      .insert([body])
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Add the creator as an admin member
    const { error: memberError } = await supabase
      .from('chat_room_members')
      .insert([{
        chat_room_id: chatRoom.id,
        user_id: chatRoom.created_by,
        role: 'admin'
      }])

    if (memberError) {
      // If adding member fails, delete the chat room
      await supabase.from('chat_rooms').delete().eq('id', chatRoom.id)
      return NextResponse.json({ error: memberError.message }, { status: 400 })
    }

    // Add AI assistant as a member of the chat room
    const aiUserId = '00000000-0000-0000-0000-000000000001'
    
    // Create AI user if it doesn't exist
    const { data: existingAI } = await supabase
      .from('users')
      .select('id')
      .eq('id', aiUserId)
      .single()

    if (!existingAI) {
      await supabase
        .from('users')
        .insert([{
          id: aiUserId,
          email: 'ai@chatapp.com',
          username: 'AI Assistant'
        }])
    }

    // Add AI as member
    await supabase
      .from('chat_room_members')
      .insert([{
        chat_room_id: chatRoom.id,
        user_id: aiUserId,
        role: 'member'
      }])

    return NextResponse.json({ chatRoom }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
