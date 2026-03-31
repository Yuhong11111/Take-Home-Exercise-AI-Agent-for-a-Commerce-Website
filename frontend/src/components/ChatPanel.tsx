import '../styles/chat-panel.css'
import { useEffect, useRef, useState } from 'react'
import type { Message } from './Message'
import axios from 'axios'

type ChatPanelProps = {
  title?: string
  onClose?: () => void
}

function getMessages(messages: Message[]): Message[] {
  const contextMessages = messages.slice(-10) // Keep last 10 messages for context
  return contextMessages
}

export default function ChatPanel({ title = 'Ask the AI', onClose }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'ai',
      content:
        "Hi! I'm your commerce AI. Ask me to compare products, search the catalog, or answer questions about what you need."
    }
  ])
  const [input, setInput] = useState('')
  const chatBodyRef = useRef<HTMLDivElement | null>(null)
  const latestRequestId = useRef(0)

  useEffect(() => {
    const el = chatBodyRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [messages])

  async function sendMessage() {
    if (!input.trim()) return

    const userMessage = { role: 'user' as const, content: input.trim() }
    // add user message to state immediately for responsiveness
    const updateMessages = [...messages, userMessage]
    setMessages((prev) => [...prev, userMessage])

    // Add user message

    setInput('')

    const requestId = ++latestRequestId.current

    // Send to backend
    try {
      const res = await axios.post('http://localhost:8000/chat', {
        messages: getMessages(updateMessages)
      })
      const data = res.data
      // console.log('Chat response:', data)
      if (requestId !== latestRequestId.current) return
      setMessages((prev) => [...prev, { role: 'ai' as const, content: data.reply }])
    } catch (err) {
      // console.error('Chat error:', err)
      if (requestId !== latestRequestId.current) return
      setMessages((prev) => [
        ...prev,
        { role: 'ai' as const, content: 'Sorry, something went wrong.' }
      ])
    }
  }
  return (
    <section className="chat-panel">
      <header className="chat-header">
        <div>
          <p className="chat-kicker">AI ASSISTANT</p>
          <h2 className="chat-title">{title}</h2>
        </div>
        <div className="chat-meta">
          {onClose && (
            <button type="button" onClick={onClose} aria-label="Close chat" className="chat-close">
              ×
            </button>
          )}
        </div>
      </header>

      <div className="chat-body" ref={chatBodyRef}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`chat-bubble chat-bubble--${msg.role}`}>
            {msg.content}
          </div>
        ))}
      </div>

      <form
        className="chat-footer"
        onSubmit={(e) => {
          e.preventDefault()
          void sendMessage()
        }}
      >
        <input
          type="text"
          placeholder="Search or ask a question..."
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit" className="chat-send">
          Send
        </button>
      </form>
    </section>
  )
}
