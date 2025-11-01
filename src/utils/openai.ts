import OpenAI from 'openai'

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export async function generateAIResponse(userMessage: string, conversationHistory: ChatMessage[] = []): Promise<string> {
  try {
    const apiKey = process.env.OPENAI_API_KEY
    
    if (!apiKey) {
      console.error('OpenAI API key not found in environment variables')
      return "I'm sorry, but I'm not properly configured to respond right now. Please check the OpenAI API key configuration."
    }

    const openai = new OpenAI({
      apiKey: apiKey,
    })

    // Prepare messages for OpenAI
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: 'You are a helpful AI assistant in a chat application. Provide helpful, friendly, and conversational responses. Keep responses concise but informative.'
      },
      ...conversationHistory.slice(-10), // Keep last 10 messages for context
      {
        role: 'user',
        content: userMessage
      }
    ]

    console.log('Sending request to OpenAI with messages:', messages.length)

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
      max_tokens: 500,
      temperature: 0.7,
    })

    const aiResponse = completion.choices[0]?.message?.content

    if (!aiResponse) {
      throw new Error('No response from OpenAI')
    }

    console.log('Received AI response:', aiResponse.substring(0, 100) + '...')
    return aiResponse.trim()
  } catch (error) {
    console.error('Error generating AI response:', error)
    
    // Fallback response based on error type
    if (error instanceof Error) {
      if (error.message.includes('API key') || error.message.includes('authentication')) {
        return "I'm sorry, but I'm not properly configured to respond right now. Please check the OpenAI API key configuration."
      }
      if (error.message.includes('quota') || error.message.includes('billing')) {
        return "I'm sorry, but there seems to be an issue with the OpenAI account. Please check your billing and usage limits."
      }
    }
    
    return "I'm sorry, I'm having trouble responding right now. Please try again in a moment."
  }
}

export function formatConversationHistory(messages: any[]): ChatMessage[] {
  return messages.map(msg => ({
    role: msg.user_id === '00000000-0000-0000-0000-000000000001' ? 'assistant' : 'user',
    content: msg.content
  }))
}
