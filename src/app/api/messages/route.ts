import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/utils/supabase'
import { InsertMessage } from '@/types/database'
import { generateAIResponse, formatConversationHistory } from '@/utils/openai'

// GET /api/messages - Get messages for a chat room
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const chatRoomId = searchParams.get('chatRoomId')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!chatRoomId) {
      return NextResponse.json(
        { error: 'chatRoomId is required' },
        { status: 400 }
      )
    }

    const { data: messages, error } = await supabase
      .from('messages')
      .select(`
        *,
        user:users(id, username, avatar_url)
      `)
      .eq('chat_room_id', chatRoomId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Reverse to show oldest first
    const reversedMessages = messages.reverse()

    return NextResponse.json({ messages: reversedMessages })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/messages - Create a new message and trigger AI response
export async function POST(request: NextRequest) {
  try {
    const body: InsertMessage = await request.json()
    
    // Save user message
    const { data: message, error } = await supabase
      .from('messages')
      .insert([body])
      .select(`
        *,
        user:users(id, username, avatar_url)
      `)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Update the chat room's updated_at timestamp
    await supabase
      .from('chat_rooms')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', body.chat_room_id)

    // Generate AI response (don't wait for it to complete)
    console.log('Triggering AI response for message:', body.content)
    generateAIResponseAsync(body.chat_room_id, body.content).catch(error => {
      console.error('AI response generation failed:', error)
    })

    return NextResponse.json({ message }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Async function to generate and save AI response
async function generateAIResponseAsync(chatRoomId: string, userMessage: string) {
  try {
    console.log('Starting AI response generation for room:', chatRoomId)
    console.log('User message:', userMessage)
    
    // Get recent conversation history
    const { data: recentMessages } = await supabase
      .from('messages')
      .select('content, user_id')
      .eq('chat_room_id', chatRoomId)
      .order('created_at', { ascending: false })
      .limit(10)

    console.log('Retrieved conversation history:', recentMessages?.length || 0, 'messages')
    const conversationHistory = formatConversationHistory(recentMessages?.reverse() || [])
    
    // Generate AI response
    console.log('Calling OpenAI API...')
    const aiResponse = await generateAIResponse(userMessage, conversationHistory)
    console.log('AI response received:', aiResponse.substring(0, 100) + '...')
    
    // Create AI assistant user if doesn't exist
    console.log('Checking for AI assistant user...')
    const aiUserId = '00000000-0000-0000-0000-000000000001' // Fixed UUID for AI
    const { data: aiUser } = await supabase
      .from('users')
      .select('id')
      .eq('id', aiUserId)
      .single()

    if (!aiUser) {
      console.log('Creating AI assistant user...')
      await supabase
        .from('users')
        .insert([{
          id: aiUserId,
          email: 'ai@chatapp.com',
          username: 'AI Assistant'
        }])
    }

    // Save AI response as message
    console.log('Saving AI response to database...')
    const { data: savedMessage, error: saveError } = await supabase
      .from('messages')
      .insert([{
        content: aiResponse,
        user_id: aiUserId,
        chat_room_id: chatRoomId,
        message_type: 'text'
      }])
      .select()

    if (saveError) {
      console.error('Error saving AI message:', saveError)
      throw saveError
    }

    console.log('AI message saved successfully:', savedMessage)

    // Update chat room timestamp
    await supabase
      .from('chat_rooms')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', chatRoomId)

    console.log('AI response generation completed successfully')

  } catch (error) {
    console.error('Error generating AI response:', error)
    
    // Send error message as AI response
    const aiUserId = '00000000-0000-0000-0000-000000000001'
    try {
      await supabase
        .from('messages')
        .insert([{
          content: "I'm sorry, I'm having trouble responding right now. Please try again.",
          user_id: aiUserId,
          chat_room_id: chatRoomId,
          message_type: 'text'
        }])
    } catch (fallbackError) {
      console.error('Failed to send fallback AI message:', fallbackError)
    }
  }
}
