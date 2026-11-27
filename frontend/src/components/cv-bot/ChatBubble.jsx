import Logo from '../branding/Logo'

/** Bulle de conversation. `from` : 'bot' ou 'user'. */
export default function ChatBubble({ from, children }) {
  return (
    <div className={`bubble-row bubble-row--${from}`}>
      {from === 'bot' && <Logo size={34} />}
      <div className={`bubble bubble--${from}`}>{children}</div>
    </div>
  )
}
