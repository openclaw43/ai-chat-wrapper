import React, { useState, useEffect } from 'react'
import { useChatStore } from '../store/chatStore'
import Message from './Message'

const ChatPanel: React.FC = () => {
  const [input, setInput] = useState('')
  const { currentConversation, isLoading, createConversation, addMessage, setLoading } = useChatStore()
  
  useEffect(() => {
    if (!currentConversation) {
      createConversation()
    }
  }, [currentConversation, createConversation])
  
  const handleSend = async () => {
    if (!input.trim() || !currentConversation) return
    
    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: input,
      timestamp: new Date()
    }
    
    addMessage(userMessage)
    setInput('')
    setLoading(true)
    
    // TODO: Implement actual API call to backend
    setTimeout(() => {
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: 'This is a simulated response. API integration coming soon!',
        timestamp: new Date(),
        model: 'google/gemini-2.0-flash-thinking-exp:free'
      }
      addMessage(assistantMessage)
      setLoading(false)
    }, 1000)
  }
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }
  
  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto p-4 mb-4 bg-white rounded-lg shadow">
        {currentConversation?.messages.map((msg) => (
          <Message
            key={msg.id}
            role={msg.role}
            content={msg.content}
            timestamp={msg.timestamp}
          />
        ))}
        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="bg-gray-200 text-gray-600 px-4 py-2 rounded-lg">
              <div className="animate-pulse">Thinking...</div>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Type your message..."
          className="flex-1 p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={2}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Send
        </button>
      </div>
    </div>
  )
}

export default ChatPanel
