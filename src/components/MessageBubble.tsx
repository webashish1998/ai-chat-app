'use client'

import { Message, User } from '@/types/database'
import MarkdownRenderer from './MarkdownRenderer'

type MessageWithUser = Message & {
  user: {
    id: string
    username: string
    avatar_url?: string
  }
}

interface MessageBubbleProps {
  message: MessageWithUser
  currentUser: User
}

export default function MessageBubble({ message, currentUser }: MessageBubbleProps) {
  const isOwnMessage = message.user_id === currentUser.id
  const isAIMessage = message.user_id === '00000000-0000-0000-0000-000000000001'
  
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex max-w-xs sm:max-w-md lg:max-w-lg xl:max-w-xl ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 ${isOwnMessage ? 'ml-2' : 'mr-2'}`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
            isAIMessage 
              ? 'bg-gradient-to-br from-purple-500 to-pink-500' 
              : isOwnMessage 
                ? 'bg-gradient-to-br from-blue-500 to-purple-600' 
                : 'bg-gradient-to-br from-green-500 to-blue-500'
          }`}>
            {isAIMessage ? (
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            ) : (
              <span className="text-white text-sm font-bold">
                {message.user.username.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
        </div>

        {/* Message Content */}
        <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'} flex-1`}>
          {/* Username and Time */}
          <div className={`flex items-center space-x-2 mb-2 ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
            <span className={`text-xs font-semibold ${
              isAIMessage 
                ? 'text-purple-600 dark:text-purple-400' 
                : 'text-gray-700 dark:text-gray-300'
            }`}>
              {isAIMessage ? 'AI Assistant' : message.user.username}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatTime(message.created_at)}
            </span>
          </div>

          {/* Message Bubble */}
          <div className={`relative px-5 py-4 rounded-2xl shadow-md ${
            isOwnMessage
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-br-md'
              : isAIMessage
                ? 'bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-purple-900/20 text-gray-900 dark:text-gray-100 border-2 border-purple-200 dark:border-purple-700 rounded-bl-md backdrop-blur-sm'
                : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-bl-md'
          }`}>
            {/* AI Badge */}
            {isAIMessage && (
              <div className="flex items-center space-x-2 mb-3 border-purple-200 dark:border-purple-700">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wide">AI Response</span>
                </div>
              </div>
            )}
            
            {/* Message Text */}
            {isAIMessage ? (
              <MarkdownRenderer 
                content={message.content} 
                className="text-sm leading-relaxed"
              />
            ) : (
              <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                {message.content}
              </div>
            )}

            {/* Message Status */}
            {isOwnMessage && (
              <div className="flex items-center justify-end mt-2 space-x-1">
                <svg className="w-3 h-3 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-xs text-white/70">Sent</span>
              </div>
            )}

            {/* Message Tail */}
            <div className={`absolute bottom-0 ${
              isOwnMessage 
                ? 'right-0 transform translate-x-1 translate-y-1' 
                : 'left-0 transform -translate-x-1 translate-y-1'
            }`}>
              <div className={`w-3 h-3 transform rotate-45 ${
                isOwnMessage
                  ? 'bg-gradient-to-br from-blue-500 to-purple-600'
                  : isAIMessage
                    ? 'bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-r border-b border-purple-200 dark:border-purple-800'
                    : 'bg-white dark:bg-gray-800 border-r border-b border-gray-200 dark:border-gray-700'
              }`}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}