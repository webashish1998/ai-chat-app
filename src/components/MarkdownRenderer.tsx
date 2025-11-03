'use client'

import React from 'react'

interface MarkdownRendererProps {
  content: string
  className?: string
}

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  // Clean citations from content before rendering
  const cleanContent = (text: string): string => {
    return text
      // Remove all citation patterns like [1], [2], [3], etc.
      .replace(/\[\d+\]/g, '')
      // Remove any remaining empty brackets
      .replace(/\[\s*\]/g, '')
      // Clean up multiple spaces (but preserve newlines)
      .replace(/ +/g, ' ')
      // Remove spaces before punctuation
      .replace(/ +([.,!?;:])/g, '$1')
      .trim()
  }

  const parseInlineMarkdown = (text: string): React.ReactNode[] => {
    const elements: React.ReactNode[] = []
    let remaining = text
    let key = 0

    while (remaining.length > 0) {
      // Bold italic ***text***
      const boldItalicMatch = remaining.match(/^\*\*\*(.+?)\*\*\*/)
      if (boldItalicMatch) {
        elements.push(
          <strong key={key++} className="font-bold italic text-gray-900 dark:text-white">
            {boldItalicMatch[1]}
          </strong>
        )
        remaining = remaining.slice(boldItalicMatch[0].length)
        continue
      }

      // Bold **text**
      const boldMatch = remaining.match(/^\*\*(.+?)\*\*/)
      if (boldMatch) {
        elements.push(
          <strong key={key++} className="font-bold text-gray-900 dark:text-white">
            {boldMatch[1]}
          </strong>
        )
        remaining = remaining.slice(boldMatch[0].length)
        continue
      }

      // Italic *text*
      const italicMatch = remaining.match(/^\*([^*]+?)\*/)
      if (italicMatch) {
        elements.push(
          <em key={key++} className="italic text-gray-800 dark:text-gray-200">
            {italicMatch[1]}
          </em>
        )
        remaining = remaining.slice(italicMatch[0].length)
        continue
      }

      // Inline code `code`
      const inlineCodeMatch = remaining.match(/^`([^`]+)`/)
      if (inlineCodeMatch) {
        elements.push(
          <code key={key++} className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 rounded text-sm font-mono">
            {inlineCodeMatch[1]}
          </code>
        )
        remaining = remaining.slice(inlineCodeMatch[0].length)
        continue
      }

      // Links [text](url)
      const linkMatch = remaining.match(/^\[([^\]]+)\]\(([^)]+)\)/)
      if (linkMatch) {
        elements.push(
          <a
            key={key++}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            {linkMatch[1]}
          </a>
        )
        remaining = remaining.slice(linkMatch[0].length)
        continue
      }

      // No match, add the next character as plain text
      elements.push(remaining[0])
      remaining = remaining.slice(1)
    }

    return elements
  }

  const renderLine = (line: string, index: number): React.ReactNode => {
    // Code blocks
    if (line.startsWith('```')) {
      return null // Handle in full content parsing
    }

    // Headers
    if (line.startsWith('### ')) {
      return (
        <h3 key={index} className="text-lg font-bold mt-4 mb-2 text-gray-900 dark:text-white">
          {parseInlineMarkdown(line.slice(4))}
        </h3>
      )
    }
    if (line.startsWith('## ')) {
      return (
        <h2 key={index} className="text-xl font-bold mt-4 mb-2 text-gray-900 dark:text-white">
          {parseInlineMarkdown(line.slice(3))}
        </h2>
      )
    }
    if (line.startsWith('# ')) {
      return (
        <h1 key={index} className="text-2xl font-bold mt-4 mb-2 text-gray-900 dark:text-white">
          {parseInlineMarkdown(line.slice(2))}
        </h1>
      )
    }

    // Blockquote
    if (line.startsWith('> ')) {
      return (
        <blockquote
          key={index}
          className="border-l-4 border-purple-500 pl-4 py-2 my-2 italic text-gray-700 dark:text-gray-300 bg-purple-50 dark:bg-purple-900/10 rounded-r"
        >
          {parseInlineMarkdown(line.slice(2))}
        </blockquote>
      )
    }

    // Horizontal rule
    if (line.trim() === '---' || line.trim() === '***' || line.trim() === '___') {
      return <hr key={index} className="my-4 border-gray-300 dark:border-gray-600" />
    }

    // Unordered list
    if (line.match(/^[\s]*[-*+]\s/)) {
      const indent = line.search(/[-*+]/)
      // Remove markdown list syntax and any bullet characters
      let content = line.replace(/^[\s]*[-*+]\s/, '').replace(/^[•·∙◦▪▫]\s*/, '')
      return (
        <li
          key={index}
          className="mb-1 text-gray-800 dark:text-gray-200 leading-relaxed list-disc ml-6"
          style={{ marginLeft: `${indent * 0.5 + 1.5}rem` }}
        >
          {parseInlineMarkdown(content)}
        </li>
      )
    }

    // Ordered list
    const orderedMatch = line.match(/^[\s]*(\d+)\.\s/)
    if (orderedMatch) {
      const indent = line.search(/\d/)
      return (
        <li
          key={index}
          className="mb-1 text-gray-800 dark:text-gray-200 leading-relaxed list-decimal ml-6"
          style={{ marginLeft: `${indent * 0.5 + 1.5}rem` }}
        >
          {parseInlineMarkdown(line.replace(/^[\s]*\d+\.\s/, ''))}
        </li>
      )
    }

    // Empty line
    if (line.trim() === '') {
      return <br key={index} className="my-1" />
    }

    // Regular paragraph
    return (
      <p key={index} className="text-gray-800 dark:text-gray-200 leading-relaxed">
        {parseInlineMarkdown(line)}
      </p>
    )
  }

  const renderContent = () => {
    const cleanedContent = cleanContent(content)
    const lines = cleanedContent.split('\n')
    const elements: React.ReactNode[] = []
    let inCodeBlock = false
    let codeLines: string[] = []
    let codeLanguage = ''
    let codeBlockIndex = 0

    lines.forEach((line, index) => {
      // Handle code blocks
      if (line.startsWith('```')) {
        if (!inCodeBlock) {
          inCodeBlock = true
          codeLanguage = line.slice(3).trim()
          codeLines = []
        } else {
          inCodeBlock = false
          elements.push(
            <div key={`code-${codeBlockIndex++}`} className="my-3 rounded-lg overflow-hidden shadow-lg">
              {codeLanguage && (
                <div className="bg-gray-700 dark:bg-gray-800 px-4 py-2 text-xs text-gray-300 font-mono border-b border-gray-600">
                  {codeLanguage}
                </div>
              )}
              <pre className="bg-gray-800 dark:bg-gray-900 p-4 overflow-x-auto">
                <code className="text-sm text-gray-100 font-mono leading-relaxed">
                  {codeLines.join('\n')}
                </code>
              </pre>
            </div>
          )
          codeLines = []
          codeLanguage = ''
        }
        return
      }

      if (inCodeBlock) {
        codeLines.push(line)
        return
      }

      elements.push(renderLine(line, index))
    })

    return elements
  }

  return (
    <div className={`markdown-content ${className}`}>
      {renderContent()}
    </div>
  )
}

