'use client'

import { useTheme } from '@/contexts/ThemeContext'

export default function ThemeDebug() {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="fixed top-4 right-4 z-50 p-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
      <div className="text-sm">
        <p className="text-gray-900 dark:text-white mb-2">
          Current theme: <strong>{theme}</strong>
        </p>
        <p className="text-gray-600 dark:text-gray-300 mb-3">
          HTML classes: {typeof document !== 'undefined' ? document.documentElement.className : 'N/A'}
        </p>
        <button
          onClick={toggleTheme}
          className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs"
        >
          Toggle Theme
        </button>
        <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded">
          <p className="text-xs text-gray-700 dark:text-gray-200">
            Tailwind dark mode test
          </p>
        </div>
        <div className="mt-2 p-2 theme-test rounded">
          <p className="text-xs">
            Custom CSS dark mode test
          </p>
        </div>
      </div>
    </div>
  )
}
