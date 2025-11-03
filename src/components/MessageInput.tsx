'use client'

import { useState, useRef, KeyboardEvent } from 'react'
import { useTheme } from '@/contexts/ThemeContext'

interface MessageInputProps {
  onSendMessage: (content: string) => void
  isProcessing?: boolean
}

export default function MessageInput({ onSendMessage, isProcessing = false }: MessageInputProps) {
  const [message, setMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { theme } = useTheme()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim() && !isProcessing) {
      onSendMessage(message)
      setMessage('')
      setIsTyping(false)
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setMessage(value)
    setIsTyping(value.length > 0)
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }

  return (
    <div className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-end space-x-3 bg-gray-50 dark:bg-gray-800 rounded-2xl p-3 border border-gray-200 dark:border-gray-700 focus-within:border-blue-500 dark:focus-within:border-blue-400 transition-all duration-200">
          {/* AI Indicator */}
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-sm">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
          </div>

          {/* Message Input */}
          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleTextareaChange}
              onKeyPress={handleKeyPress}
              placeholder={isProcessing ? "AI is thinking..." : "Ask AI anything... ✨"}
              disabled={isProcessing}
              className="w-full bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none focus:outline-none text-sm leading-relaxed min-h-[24px] max-h-[120px] disabled:opacity-50 disabled:cursor-not-allowed"
              rows={1}
            />
          </div>

          {/* Send Button */}
          <div className="flex items-center space-x-2">
            {/* Character Counter */}
            {message.length > 0 && (
              <div className="text-xs text-gray-400 dark:text-gray-500 min-w-[2rem] text-right">
                {message.length}
              </div>
            )}
            
            {/* Send Button */}
            <button
              type="submit"
              disabled={!message.trim() || isProcessing}
              className={`p-2 rounded-xl transition-all duration-200 focus-ring ${
                message.trim() && !isProcessing
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              }`}
            >
              {isProcessing ? (
                <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Helper Text */}
        <div className="flex items-center justify-between mt-2 px-1">
          <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-1">
              <kbd className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">Enter</kbd>
              <span>to send</span>
            </div>
            <div className="flex items-center space-x-1">
              <kbd className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">Shift</kbd>
              <span>+</span>
              <kbd className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">Enter</kbd>
              <span>for new line</span>
            </div>
          </div>
          
          {isProcessing ? (
            <div className="flex items-center space-x-1 text-xs text-purple-500 dark:text-purple-400">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              <span>AI is processing your message...</span>
            </div>
          ) : isTyping && (
            <div className="flex items-center space-x-1 text-xs text-blue-500 dark:text-blue-400">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span>AI is ready to respond</span>
            </div>
          )}
        </div>
      </form>
    </div>
  )
}