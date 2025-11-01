import OpenAI from 'openai'

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

// Timeout helper function
function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs)
    )
  ])
}

// Retry helper function
async function retry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | null = null
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      console.log(`Attempt ${attempt}/${maxRetries} failed:`, lastError.message)
      
      if (attempt < maxRetries) {
        // Exponential backoff
        const waitTime = delayMs * Math.pow(2, attempt - 1)
        console.log(`Retrying in ${waitTime}ms...`)
        await new Promise(resolve => setTimeout(resolve, waitTime))
      }
    }
  }
  
  throw lastError || new Error('All retry attempts failed')
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
      timeout: 25000, // 25 second timeout (Vercel functions have 10s Hobby, 60s Pro)
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

    // Use retry with timeout (25 seconds max, 3 retries)
    const completion = await retry(async () => {
      return withTimeout(
        openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: messages,
          max_tokens: 500,
          temperature: 0.7,
        }),
        20000 // 20 second timeout per attempt
      )
    }, 3, 1000) // 3 retries with 1s initial delay

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
      if (error.message.includes('timeout') || error.message.includes('timed out')) {
        return "I'm sorry, the request took too long. Please try again with a shorter message."
      }
      if (error.message.includes('API key') || error.message.includes('authentication')) {
        return "I'm sorry, but I'm not properly configured to respond right now. Please check the OpenAI API key configuration."
      }
      if (error.message.includes('quota') || error.message.includes('billing')) {
        return "I'm sorry, but there seems to be an issue with the OpenAI account. Please check your billing and usage limits."
      }
      if (error.message.includes('rate limit')) {
        return "I'm receiving too many requests right now. Please wait a moment and try again."
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
