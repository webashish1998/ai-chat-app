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

    // Generate AI response asynchronously (fire and forget)
    // Use setTimeout to ensure the response is sent first, then start AI generation
    console.log('Triggering AI response for message:', body.content)
    
    // Ensure the main response is sent before starting AI generation
    // This helps ensure the function doesn't terminate too early
    setImmediate(() => {
      generateAIResponseAsync(body.chat_room_id, body.content).catch(error => {
        console.error('AI response generation failed:', error)
      })
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
// This runs in the background after the main response is sent
async function generateAIResponseAsync(chatRoomId: string, userMessage: string) {
  const startTime = Date.now()
  try {
    console.log('Starting AI response generation for room:', chatRoomId)
    console.log('User message:', userMessage)
    
    // Create AI assistant user if doesn't exist (do this first to avoid issues)
    const aiUserId = '00000000-0000-0000-0000-000000000001'
    const { data: aiUser } = await supabase
      .from('users')
      .select('id')
      .eq('id', aiUserId)
      .single()

    if (!aiUser) {
      console.log('Creating AI assistant user...')
      const { error: userError } = await supabase
        .from('users')
        .insert([{
          id: aiUserId,
          email: 'ai@chatapp.com',
          username: 'AI Assistant'
        }])
      if (userError && !userError.message.includes('duplicate')) {
        console.error('Error creating AI user:', userError)
      }
    }
    
    // Get recent conversation history (limit to 8 messages for faster processing)
    const { data: recentMessages, error: historyError } = await supabase
      .from('messages')
      .select('content, user_id')
      .eq('chat_room_id', chatRoomId)
      .order('created_at', { ascending: false })
      .limit(8) // Reduced from 10 for faster processing

    if (historyError) {
      console.error('Error fetching conversation history:', historyError)
    }

    console.log('Retrieved conversation history:', recentMessages?.length || 0, 'messages')
    const conversationHistory = formatConversationHistory(recentMessages?.reverse() || [])
    
    // Generate AI response with timeout and retry logic
    console.log('Calling OpenAI API...')
    const aiResponse = await generateAIResponse(userMessage, conversationHistory)
    console.log('AI response received:', aiResponse.substring(0, 100) + '...')
    
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

    // Update chat room timestamp (don't await - fire and forget)
    const duration = Date.now() - startTime
    console.log(`AI response generation completed successfully in ${duration}ms`)
    
    // Update timestamp asynchronously (don't wait for it)
    ;(async () => {
      try {
        await supabase
          .from('chat_rooms')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', chatRoomId)
      } catch (err) {
        console.error('Error updating chat room timestamp:', err)
      }
    })()

  } catch (error) {
    const duration = Date.now() - startTime
    console.error(`Error generating AI response after ${duration}ms:`, error)
    
    // Send error message as AI response (with timeout protection)
    const aiUserId = '00000000-0000-0000-0000-000000000001'
    try {
      const errorMessage = error instanceof Error && error.message.includes('timeout')
        ? "I'm sorry, the request took too long. Please try again with a shorter message."
        : "I'm sorry, I'm having trouble responding right now. Please try again."
      
      await Promise.race([
        supabase
          .from('messages')
          .insert([{
            content: errorMessage,
            user_id: aiUserId,
            chat_room_id: chatRoomId,
            message_type: 'text'
          }]),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Fallback message timeout')), 5000)
        )
      ])
    } catch (fallbackError) {
      console.error('Failed to send fallback AI message:', fallbackError)
    }
  }
}
