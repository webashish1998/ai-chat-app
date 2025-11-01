'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import ChatSidebar from '@/components/ChatSidebar'
import ChatWindow from '@/components/ChatWindow'
import AuthModal from '@/components/AuthModal'
import { User, ChatRoom } from '@/types/database'

function HomeContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [selectedChatRoom, setSelectedChatRoom] = useState<ChatRoom | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(true)
  const [isLoading, setIsLoading] = useState(true)

  // Check for existing session on component mount
  useEffect(() => {
    const checkExistingSession = () => {
      try {
        const savedUser = localStorage.getItem('chatAppUser')
        if (savedUser) {
          const user = JSON.parse(savedUser)
          setCurrentUser(user)
          setShowAuthModal(false)
        }
      } catch (error) {
        console.error('Error loading saved session:', error)
        localStorage.removeItem('chatAppUser')
      } finally {
        setIsLoading(false)
      }
    }

    checkExistingSession()
  }, [])

  // Load chat room from URL parameter
  useEffect(() => {
    const roomId = searchParams.get('room')
    if (currentUser) {
      if (roomId) {
        // If there's a room ID in URL, load that room
        if (!selectedChatRoom || selectedChatRoom.id !== roomId) {
          fetchChatRoom(roomId)
        }
      } else {
        // If no room ID in URL, clear selected room (go to home)
        if (selectedChatRoom) {
          setSelectedChatRoom(null)
        }
      }
    }
  }, [searchParams, currentUser])

  const fetchChatRoom = async (roomId: string) => {
    try {
      const response = await fetch(`/api/chat-rooms/${roomId}`)
      if (response.ok) {
        const { chatRoom } = await response.json()
        setSelectedChatRoom(chatRoom)
      } else {
        // Room not found or access denied, clear URL parameter
        router.push('/')
      }
    } catch (error) {
      console.error('Error fetching chat room:', error)
      // Clear URL parameter on error
      router.push('/')
    }
  }

  const handleUserLogin = (user: User) => {
    setCurrentUser(user)
    setShowAuthModal(false)
    // Save user to localStorage for session persistence
    localStorage.setItem('chatAppUser', JSON.stringify(user))
  }

  const handleSelectChatRoom = (chatRoom: ChatRoom) => {
    setSelectedChatRoom(chatRoom)
    // Update URL with room parameter
    router.push(`/?room=${chatRoom.id}`)
  }

  const handleGoHome = () => {
    setSelectedChatRoom(null)
    // Clear URL parameters to go to home
    router.push('/')
  }

  const handleLogout = () => {
    setCurrentUser(null)
    setSelectedChatRoom(null)
    setShowAuthModal(true)
    // Clear saved session
    localStorage.removeItem('chatAppUser')
    // Clear URL parameters
    router.push('/')
  }

  // Show loading state while checking for existing session
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (showAuthModal || !currentUser) {
    return <AuthModal onUserLogin={handleUserLogin} />
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <ChatSidebar
        currentUser={currentUser}
        selectedChatRoom={selectedChatRoom}
        onSelectChatRoom={handleSelectChatRoom}
        onLogout={handleLogout}
      />
      <ChatWindow
        currentUser={currentUser}
        chatRoom={selectedChatRoom}
        onGoHome={handleGoHome}
      />
    </div>
  )
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  )
}