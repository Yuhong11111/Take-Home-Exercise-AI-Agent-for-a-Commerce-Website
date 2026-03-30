import ChatPanel from '../components/ChatPanel.jsx'
import '../styles/chat-panel.css'

export default function Chat() {
  return (
    <div className="chat-page">
      <ChatPanel title="Chat with the assistant" />
    </div>
  )
}
