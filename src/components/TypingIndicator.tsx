'use client'

export default function TypingIndicator() {
  return (
    <div className="flex justify-start mb-4">
      <div className="flex items-end space-x-2 max-w-xs sm:max-w-md lg:max-w-lg">
        {/* AI Avatar */}
        <div className="flex-shrink-0 mr-2">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
        </div>

        {/* Typing Bubble */}
        <div className="flex flex-col items-start">
          {/* Username and Status */}
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
              AI Assistant
            </span>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-500 dark:text-gray-400">thinking...</span>
            </div>
          </div>

          {/* Typing Animation Bubble */}
          <div className="relative bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
            {/* AI Badge */}
            <div className="flex items-center space-x-1 mb-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-purple-600 dark:text-purple-400">AI Response</span>
            </div>

            {/* Typing Dots */}
            <div className="flex items-center space-x-1">
              <div className="flex space-x-1">
                <div 
                  className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                  style={{ animationDelay: '0ms' }}
                ></div>
                <div 
                  className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                  style={{ animationDelay: '150ms' }}
                ></div>
                <div 
                  className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                  style={{ animationDelay: '300ms' }}
                ></div>
              </div>
              <span className="text-sm text-purple-600 dark:text-purple-400 ml-2 animate-pulse">
                Generating response
              </span>
            </div>

            {/* Message Tail */}
            <div className="absolute bottom-0 left-0 transform -translate-x-1 translate-y-1">
              <div className="w-3 h-3 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-r border-b border-purple-200 dark:border-purple-800 transform rotate-45"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}