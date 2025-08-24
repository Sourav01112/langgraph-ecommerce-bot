'use client'
import React, { useState, useEffect, useRef, ChangeEvent, FormEvent } from 'react'
import { FaRobot, FaPaperPlane, FaTimes, FaCommentDots } from 'react-icons/fa'

interface Message {
  text: string
  isAgent: boolean
  threadId?: string
}

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState<string>('')
  const [threadId, setThreadId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        { text: "Hello! I'm your shopping assistant. How can I help you today?", isAgent: true }
      ])
    }
  }, [isOpen, messages.length])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const toggleChat = () => {
    setIsOpen(!isOpen)
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  const handleSendMessage = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    const userMessage: Message = {
      text: inputValue,
      isAgent: false
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')

    // const endpoint = threadId ? `${import.meta.env.NEXT_PUBLIC_API_BASE}/chat/${threadId}` : `${import.meta.env.NEXT_PUBLIC_API_BASE}/chat`


    const endpoint = threadId
  ? `${import.meta.env.NEXT_PUBLIC_API_BASE}/chat/${threadId}`
  : `${import.meta.env.NEXT_PUBLIC_API_BASE}/chat`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: inputValue }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      const agentMessage: Message = {
        text: data.response,
        isAgent: true,
        threadId: data.threadId,
      }

      setMessages(prev => [...prev, agentMessage])
      setThreadId(data.threadId)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  return (
    <div className={`chat-widget-container ${isOpen ? 'open' : ''}`}>
      {isOpen ? (
        <>
          <div className="chat-header">
            <div className="chat-title flex items-center space-x-2">
              <FaRobot />
              <h3>Hi, I’m your assistant.</h3>
            </div>
            <button className="close-button" onClick={toggleChat}>
              <FaTimes />
            </button>
          </div>

          <div className="chat-messages overflow-y-auto max-h-96 p-2">
            {messages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.isAgent ? 'message-bot' : 'message-user'}`}>
                {msg.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form className="chat-input-container flex" onSubmit={handleSendMessage}>
            <input
              type="text"
              className="message-input flex-grow border rounded-l px-3 py-2 focus:outline-none"
              placeholder="Type your message..."
              value={inputValue}
              onChange={handleInputChange}
              aria-label="Message input"
            />
            <button
              type="submit"
              className="send-button text-white px-4 rounded-r disabled:opacity-50"
              disabled={inputValue.trim() === ''}
              aria-label="Send message"
            >
              <FaPaperPlane size={16} />
            </button>
          </form>
        </>
      ) : (
        <button className="chat-button p-3 rounded-full  text-white" onClick={toggleChat} aria-label="Open chat">
          <FaCommentDots size={24} />
        </button>
      )}
    </div>
  )
}

export default ChatWidget
