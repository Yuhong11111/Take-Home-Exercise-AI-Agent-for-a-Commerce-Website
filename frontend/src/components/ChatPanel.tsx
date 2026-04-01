import '../styles/chat-panel.css'
import { useEffect, useRef, useState } from 'react'
import type { Message, Product } from './Message'
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
  const [imageFile, setImageFile] = useState<File | null>(null)
  const imageInputRef = useRef<HTMLInputElement | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const el = chatBodyRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [messages])

  function renderMessageText(text: string) {
    return text.split(/(\*\*[^*]+\*\*)/g).map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={idx}>{part.slice(2, -2)}</strong>
      }
      return <span key={idx}>{part}</span>
    })
  }

  async function sendMessage() {
    const trimmed = input.trim()
    if (!trimmed && !imageFile) return
    if (loading) return
    setLoading(true)

    const imagePreviewUrl = imageFile ? URL.createObjectURL(imageFile) : undefined
    const userMessage = {
      role: 'user' as const,
      content: trimmed || 'Sent an image.',
      imageUrl: imagePreviewUrl
    }
    // add user message to state immediately for responsiveness
    const updateMessages = [...messages, userMessage]
    setMessages((prev) => [...prev, userMessage])

    // Add user message

    setInput('')
    setImageFile(null)
    if (imageInputRef.current) {
      imageInputRef.current.value = ''
    }

    const requestId = ++latestRequestId.current

    // Send to backend
    try {
      const formData = new FormData()
      formData.append('messages_json', JSON.stringify({ messages: getMessages(updateMessages) }))
      if (imageFile) {
        formData.append('image', imageFile)
      }

      const apiBaseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:8000"
      const res = await axios.post(`${apiBaseUrl}/chat`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      const data = res.data as { reply: string; products?: Product[] }
      // console.log('Chat response:', data.products)
      // console.log('Chat response:', data)
      if (requestId !== latestRequestId.current) return
      setMessages((prev) => [
        ...prev,
        { role: 'ai' as const, content: data.reply, products: data.products ?? [] }
      ])
    } catch (err) {
      // console.error('Chat error:', err)
      if (requestId !== latestRequestId.current) return
      setMessages((prev) => [
        ...prev,
        { role: 'ai' as const, content: 'Sorry, something went wrong.' }
      ])
    } finally {
      if (requestId === latestRequestId.current) {
        setLoading(false)
      }
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
            <div className="chat-bubble-text">{renderMessageText(msg.content)}</div>
            {msg.imageUrl && (
              <img className="chat-bubble-image" src={msg.imageUrl} alt="Uploaded preview" />
            )}
            {!!msg.products?.length && (
              <div className="chat-products">
                {msg.products.map((product) => (
                  <div key={product.id} className="chat-product">
                    <div className="chat-product-media">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} />
                      ) : (
                        'Product'
                      )}
                    </div>
                    <div className="chat-product-meta">
                      <div className="chat-product-title">{product.name}</div>
                      <div className="chat-product-price">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD',
                          maximumFractionDigits: 0
                        }).format(product.price)}
                      </div>
                      <div className="chat-product-category">{product.category}</div>
                      <div className="chat-product-tag">{product.tag}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="chat-bubble chat-bubble--ai">
            <div className="chat-bubble-text">
              <span className="chat-spinner" aria-label="Loading" />
            </div>
          </div>
        )}
      </div>

      <form
        className="chat-footer"
        onSubmit={(e) => {
          e.preventDefault()
          void sendMessage()
        }}
      >
        <input
          type="file"
          accept="image/*"
          className="chat-image"
          ref={imageInputRef}
          onChange={(e) => {
            const file = e.target.files?.[0] ?? null
            setImageFile(file)
          }}
          disabled={loading}
        />
        <input
          type="text"
          placeholder="Search or ask a question..."
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <button type="submit" className="chat-send" disabled={loading}>
          {loading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </section>
  )
}
