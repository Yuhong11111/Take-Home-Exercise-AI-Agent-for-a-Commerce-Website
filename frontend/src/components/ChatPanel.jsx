import '../styles/chat-panel.css'

export default function ChatPanel({ title = "Ask the AI", onClose }) {
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

      {/* Chat bubbles */}
      <div className="chat-body">
        <div className="chat-bubble chat-bubble--ai">
          What do you need help with? You can ask me to find products, suggest styles, or answer questions about our collection.
        </div>
        <div className="chat-bubble chat-bubble--user">
          I need a minimalist lamp for my desk.
        </div>
        <div className="chat-bubble chat-bubble--ai">
          Got it. Do you prefer warm or neutral lighting, and what is your budget?
        </div>
      </div>

      <form className="chat-footer">
        <input type="text" placeholder="Search or ask a question..." className="chat-input" />
        <button type="button" className="chat-send">
          Send
        </button>
      </form>
    </section>
  )
}
