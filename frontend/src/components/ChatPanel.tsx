import '../styles/chat-panel.css'
import { useState } from 'react'
import type { Message } from './Message'
import axios from 'axios'

type ChatPanelProps = {
  title?: string
  onClose?: () => void
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

  async function sendMessage() {
    if (!input.trim()) return

    // Add user message
    const newMessages = [
      ...messages,
      { role: 'user' as const, content: input }
    ]
    setMessages(newMessages)
    setInput('')

    // Send to backend
    try {
      const res = await axios.post('http://localhost:8000/chat', {
        messages: newMessages
      })
      const data = res.data
      console.log('Chat response:', data)
      setMessages([...newMessages, { role: 'ai' as const, content: data.reply }])
    } catch (err) {
      console.error('Chat error:', err)
      setMessages([...newMessages, { role: 'ai' as const, content: 'Sorry, something went wrong.' }])
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

      <div className="chat-body">
        {messages.map((msg, idx) => (
          <div key={idx} className={`chat-bubble chat-bubble--${msg.role}`}>
            {msg.content}
          </div>
        ))}
      </div>

      <form className="chat-footer">
        <input
          type="text"
          placeholder="Search or ask a question..."
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="button" className="chat-send" onClick={sendMessage}>
          Send
        </button>
      </form>
    </section>
  )
}
