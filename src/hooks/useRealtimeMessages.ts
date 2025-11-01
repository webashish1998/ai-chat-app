'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabase'
import { Message } from '@/types/database'

type MessageWithUser = Message & {
  user: {
    id: string
    username: string
    avatar_url?: string
  }
}

export function useRealtimeMessages(chatRoomId: string | null) {
  const [messages, setMessages] = useState<MessageWithUser[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!chatRoomId) {
      setMessages([])
      return
    }

    // Fetch initial messages
    fetchMessages()

    // Set up real-time subscription
    const subscription = supabase
      .channel(`messages:${chatRoomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_room_id=eq.${chatRoomId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message
          // Fetch the complete message with user data
          fetchMessageWithUser(newMessage.id)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `chat_room_id=eq.${chatRoomId}`,
        },
        (payload) => {
          const updatedMessage = payload.new as Message
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === updatedMessage.id ? { ...msg, ...updatedMessage } : msg
            )
          )
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'messages',
          filter: `chat_room_id=eq.${chatRoomId}`,
        },
        (payload) => {
          const deletedMessage = payload.old as Message
          setMessages((prev) => prev.filter((msg) => msg.id !== deletedMessage.id))
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [chatRoomId])

  const fetchMessages = async () => {
    if (!chatRoomId) return

    setLoading(true)
    try {
      const response = await fetch(`/api/messages?chatRoomId=${chatRoomId}&limit=50`)
      if (response.ok) {
        const { messages } = await response.json()
        setMessages(messages)
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessageWithUser = async (messageId: string) => {
    try {
      const response = await fetch(`/api/messages/${messageId}`)
      if (response.ok) {
        const { message } = await response.json()
        setMessages((prev) => {
          // Check if this is replacing an optimistic message
          const optimisticIndex = prev.findIndex((msg) => 
            msg.id.startsWith('temp-') && 
            msg.user_id === message.user_id && 
            msg.content === message.content
          )
          
          if (optimisticIndex !== -1) {
            // Replace optimistic message with real one
            const newMessages = [...prev]
            newMessages[optimisticIndex] = message
            return newMessages
          }
          
          // Check if message already exists to avoid duplicates
          const exists = prev.some((msg) => msg.id === message.id)
          if (exists) return prev
          
          return [...prev, message]
        })
      }
    } catch (error) {
      console.error('Error fetching message with user:', error)
    }
  }

  const sendMessage = async (content: string, userId: string, userDetails?: { username: string; avatar_url?: string }) => {
    if (!chatRoomId || !content.trim()) return

    // Create optimistic message (appears immediately)
    const optimisticMessage: MessageWithUser = {
      id: `temp-${Date.now()}`, // Temporary ID
      content: content.trim(),
      user_id: userId,
      chat_room_id: chatRoomId,
      message_type: 'text',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user: {
        id: userId,
        username: userDetails?.username || 'You',
        avatar_url: userDetails?.avatar_url
      }
    }

    // Add message immediately to UI (optimistic update)
    setMessages((prev) => [...prev, optimisticMessage])

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: content.trim(),
          user_id: userId,
          chat_room_id: chatRoomId,
          message_type: 'text',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      // The real message will come through the real-time subscription
      // and replace the optimistic one
    } catch (error) {
      console.error('Error sending message:', error)
      
      // Remove the optimistic message on error
      setMessages((prev) => prev.filter((msg) => msg.id !== optimisticMessage.id))
      
      throw error
    }
  }

  return {
    messages,
    loading,
    sendMessage,
    refetch: fetchMessages,
  }
}
