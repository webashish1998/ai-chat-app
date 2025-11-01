'use client'

import { useEffect, useState, useRef } from 'react'
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
  const lastMessageIdRef = useRef<string | null>(null)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)

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
          console.log('Real-time subscription: New message received', newMessage.id)
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
      .subscribe((status) => {
        console.log('Supabase subscription status:', status)
        // Keep polling as backup even when subscribed (for reliability)
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.warn('Real-time subscription failed, relying on polling')
          // Polling is already started, but ensure it continues
        }
      })

    // Always poll as backup to real-time subscription
    // This ensures messages appear even if real-time subscription is delayed or fails
    // Polling frequency is low (2s) so it doesn't impact performance much
    startPolling()

    return () => {
      subscription.unsubscribe()
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
    }
  }, [chatRoomId])

  const startPolling = () => {
    // Clear any existing polling
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
    }

    // Poll for new messages every 2 seconds as fallback
    pollingIntervalRef.current = setInterval(() => {
      if (!chatRoomId) return
      
      // Fetch recent messages to check for new ones
      fetch(`/api/messages?chatRoomId=${chatRoomId}&limit=10`)
        .then(res => res.json())
        .then(data => {
          if (data.messages && data.messages.length > 0) {
            // Get the latest message ID from fetched messages
            const latestMessageId = data.messages[data.messages.length - 1]?.id
            
            // Check if we have a new message we haven't seen
            if (latestMessageId && latestMessageId !== lastMessageIdRef.current) {
              console.log('Polling: New message(s) detected, fetching missing messages')
              
              // Check all fetched messages and add any missing ones
              setMessages((prev) => {
                const existingIds = new Set(prev.map(msg => msg.id))
                const newMessages = data.messages.filter((msg: MessageWithUser) => !existingIds.has(msg.id))
                
                if (newMessages.length > 0) {
                  console.log(`Polling: Found ${newMessages.length} new message(s)`)
                  // Fetch full message details for each new message
                  newMessages.forEach((msg: MessageWithUser) => {
                    fetchMessageWithUser(msg.id)
                  })
                  lastMessageIdRef.current = latestMessageId
                }
                return prev
              })
            }
          }
        })
        .catch(err => console.error('Polling error:', err))
    }, 2000) // Poll every 2 seconds
  }

  const fetchMessages = async () => {
    if (!chatRoomId) return

    setLoading(true)
    try {
      const response = await fetch(`/api/messages?chatRoomId=${chatRoomId}&limit=50`)
      if (response.ok) {
        const { messages: fetchedMessages } = await response.json()
        setMessages(fetchedMessages)
        // Update last message ID
        if (fetchedMessages.length > 0) {
          lastMessageIdRef.current = fetchedMessages[fetchedMessages.length - 1]?.id || null
        }
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
