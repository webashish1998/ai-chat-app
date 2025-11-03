import OpenAI from 'openai'

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export async function generateAIResponse(userMessage: string, conversationHistory: ChatMessage[] = []): Promise<string> {
  try {
    const apiKey = process.env.PERPLEXITY_API_KEY
    
    if (!apiKey) {
      console.error('Perplexity API key not found in environment variables')
      return "I'm sorry, but I'm not properly configured to respond right now. Please check the Perplexity API key configuration."
    }

    const perplexity = new OpenAI({
      apiKey: apiKey,
      baseURL: 'https://api.perplexity.ai',
    })

    // Prepare messages for Perplexity
    // Filter conversation history to ensure alternating messages
    const filteredHistory: ChatMessage[] = []
    let lastRole: string | null = null
    
    for (const msg of conversationHistory.slice(-10)) {
      // Skip consecutive messages with the same role
      if (msg.role !== lastRole) {
        filteredHistory.push(msg)
        lastRole = msg.role
      }
    }
    
    // Ensure the last message in history is not a user message (to avoid consecutive user messages)
    if (filteredHistory.length > 0 && filteredHistory[filteredHistory.length - 1].role === 'user') {
      filteredHistory.pop()
    }
    
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: 'You are a helpful AI assistant in a chat application. Provide helpful, friendly, and conversational responses. Keep responses concise but informative.'
      },
      ...filteredHistory,
      {
        role: 'user',
        content: userMessage
      }
    ]

    console.log('Sending request to Perplexity with messages:', messages.length)

    const completion = await perplexity.chat.completions.create({
      model: 'sonar',
      messages: messages,
      max_tokens: 500,
      temperature: 0.7,
    })

    const aiResponse = completion.choices[0]?.message?.content

    if (!aiResponse) {
      throw new Error('No response from Perplexity')
    }

    // Remove citation numbers [1], [2], etc. and clean up the response
    let cleanedResponse = aiResponse
      // Remove all citation patterns like [1], [2], [3], etc.
      .replace(/\[\d+\]/g, '')
      // Remove any remaining empty brackets
      .replace(/\[\s*\]/g, '')
      // Clean up multiple spaces (but not newlines)
      .replace(/ +/g, ' ')
      // Remove spaces before punctuation
      .replace(/ +([.,!?;:])/g, '$1')
      .trim()

    console.log('Received AI response:', cleanedResponse.substring(0, 100) + '...')
    return cleanedResponse
  } catch (error) {
    console.error('Error generating AI response:', error)
    
    // Fallback response based on error type
    if (error instanceof Error) {
      if (error.message.includes('API key') || error.message.includes('authentication') || error.message.includes('401')) {
        return "I'm sorry, but I'm not properly configured to respond right now. Please check the Perplexity API key configuration."
      }
      if (error.message.includes('quota') || error.message.includes('billing') || error.message.includes('429')) {
        return "I'm sorry, but there seems to be an issue with the Perplexity account. Please check your billing and usage limits."
      }
      if (error.message.includes('400') || error.message.includes('alternate')) {
        return "I'm sorry, there was an issue with the message format. Please try rephrasing your message."
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

