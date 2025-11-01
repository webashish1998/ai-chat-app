'use client'

import { useState, useEffect } from 'react'
import { User, ChatRoom } from '@/types/database'
import CreateChatRoomModal from './CreateChatRoomModal'
import LogoutConfirmModal from './LogoutConfirmModal'
import { useTheme } from '@/contexts/ThemeContext'

interface ChatSidebarProps {
  currentUser: User
  selectedChatRoom: ChatRoom | null
  onSelectChatRoom: (chatRoom: ChatRoom) => void
  onLogout: () => void
}

export default function ChatSidebar({
  currentUser,
  selectedChatRoom,
  onSelectChatRoom,
  onLogout
}: ChatSidebarProps) {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    fetchChatRooms()
  }, [currentUser])

  const fetchChatRooms = async () => {
    try {
      const response = await fetch(`/api/chat-rooms?userId=${currentUser.id}`)
      if (response.ok) {
        const { chatRooms } = await response.json()
        setChatRooms(chatRooms)
      }
    } catch (error) {
      console.error('Error fetching chat rooms:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateChatRoom = async (name: string, description: string) => {
    try {
      const response = await fetch('/api/chat-rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description,
          created_by: currentUser.id,
        }),
      })

      if (response.ok) {
        const { chatRoom } = await response.json()
        setChatRooms([chatRoom, ...chatRooms])
        setShowCreateModal(false)
        onSelectChatRoom(chatRoom)
      }
    } catch (error) {
      console.error('Error creating chat room:', error)
    }
  }

  const handleLogoutClick = () => {
    setShowLogoutModal(true)
  }

  const handleLogoutConfirm = () => {
    setShowLogoutModal(false)
    onLogout()
  }

  const handleLogoutCancel = () => {
    setShowLogoutModal(false)
  }

  return (
    <div className="w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col shadow-xl">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center ring-2 ring-white/30">
                <span className="text-white text-sm font-bold">
                  {currentUser.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{currentUser.username}</p>
              <p 
                className="text-xs text-white/70 cursor-help" 
                title={currentUser.email}
              >
                {currentUser.email.length > 20 
                  ? `${currentUser.email.substring(0, 20)}...` 
                  : currentUser.email
                }
              </p>
            </div>
          </div>
          <div className="flex items-center">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 focus-ring"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </button>
            {/* Logout Button */}
            <button
              onClick={handleLogoutClick}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 focus-ring"
              title="Logout"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Chat Rooms Header */}
      <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">AI Chats</h2>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl focus-ring flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>New Chat</span>
          </button>
        </div>
      </div>

      {/* Chat Rooms List */}
      <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-800/30">
        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400">Loading chats...</p>
          </div>
        ) : chatRooms.length === 0 ? (
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No AI Chats Yet</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Create your first AI chat room to start an intelligent conversation!</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Create First Chat
            </button>
          </div>
        ) : (
          <div className="p-3 space-y-2">
            {chatRooms.map((room, index) => (
              <button
                key={room.id}
                onClick={() => onSelectChatRoom(room)}
                className={`w-full text-left p-4 rounded-xl transition-all duration-200 animate-fade-in group ${
                  selectedChatRoom?.id === room.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg scale-101'
                    : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-md hover:scale-102 text-gray-900 dark:text-white'
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start space-x-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                    selectedChatRoom?.id === room.id
                      ? 'bg-white/20 backdrop-blur-sm'
                      : 'bg-gradient-to-br from-blue-500 to-purple-600 group-hover:from-blue-600 group-hover:to-purple-700'
                  }`}>
                    <span className={`text-sm font-bold ${
                      selectedChatRoom?.id === room.id ? 'text-white' : 'text-white'
                    }`}>
                      {room.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-sm font-semibold truncate mb-1 ${
                      selectedChatRoom?.id === room.id ? 'text-white' : 'text-gray-900 dark:text-white'
                    }`}>
                      {room.name}
                    </h3>
                    {room.description && (
                      <p className={`text-xs truncate mb-2 ${
                        selectedChatRoom?.id === room.id ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {room.description}
                      </p>
                    )}
                    <div className="flex items-center space-x-2">
                      <div className={`flex items-center space-x-1 ${
                        selectedChatRoom?.id === room.id ? 'text-white/80' : 'text-gray-400 dark:text-gray-500'
                      }`}>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        <span className="text-xs font-medium">AI Chat</span>
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Create Chat Room Modal */}
      {showCreateModal && (
        <CreateChatRoomModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateChatRoom}
        />
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <LogoutConfirmModal
          onConfirm={handleLogoutConfirm}
          onCancel={handleLogoutCancel}
          username={currentUser.username}
        />
      )}
    </div>
  )
}