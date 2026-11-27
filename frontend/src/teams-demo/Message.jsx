import { PEOPLE } from './data'
import TmAvatar from './TmAvatar'
import TrajectoiresCard from './TrajectoiresCard'

/** Un message : bulle à droite pour moi, à gauche avec avatar pour les autres. */
export default function Message({ message, showAuthor, onOpen }) {
  const mine = message.from === 'me'
  const author = PEOPLE[message.from]
  return (
    <div className={`tm-msg ${mine ? 'tm-msg--mine' : ''}`}>
      {!mine && <span className="tm-msg__avatar">{showAuthor && <TmAvatar person={author} size={30} presence={null} />}</span>}
      <div className="tm-msg__body">
        {showAuthor && (
          <span className="tm-msg__meta">
            {!mine && <strong>{author.name}</strong>} {message.time}
          </span>
        )}
        {message.card ? (
          <TrajectoiresCard card={message.card} onOpen={onOpen} />
        ) : (
          <div className="tm-bubble">
            {message.text}
            {message.file && <span className="tm-file">{message.file}</span>}
          </div>
        )}
        {message.reactions && (
          <span className="tm-reactions">
            {message.reactions.map((r) => (
              <span key={r}>{r}</span>
            ))}
          </span>
        )}
      </div>
    </div>
  )
}
