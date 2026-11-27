import { useEffect, useRef } from 'react'
import Composer from './Composer'
import Icon from './icons'
import Message from './Message'
import { PEOPLE } from './data'
import TmAvatar from './TmAvatar'

/** Fil d'une conversation : en-tête, messages, indicateur de saisie, zone de saisie. */
export default function Conversation({ chat, onSend, onOpen }) {
  const end = useRef(null)
  useEffect(() => {
    end.current?.scrollIntoView({ block: 'end' })
  }, [chat])

  const people = chat.group ? chat.group.map((id) => PEOPLE[id].name.split(' ')[0]).join(', ') : null
  return (
    <section className="tm-conv">
      <header className="tm-conv__head">
        {chat.group ? <TmAvatar group={chat.group} size={32} /> : <TmAvatar person={PEOPLE[chat.with]} size={32} />}
        <div>
          <strong>{chat.title}</strong>
          {people && <span className="tm-muted">{people} et vous</span>}
        </div>
        <nav className="tm-tabs">
          <span className="is-active">Conversation</span>
          <span>Fichiers</span>
          {chat.with === 'bot' && <span onClick={() => onOpen(null)}>Trajectoires</span>}
        </nav>
        <span className="tm-conv__actions">
          <button type="button" className="tm-icon-button" aria-label="Appel vidéo"><Icon name="video" size={18} /></button>
          <button type="button" className="tm-icon-button" aria-label="Appel audio"><Icon name="call" size={18} /></button>
        </span>
      </header>
      <div className="tm-conv__messages">
        {chat.messages.map((m, i) => (
          <Message
            key={i}
            message={m}
            showAuthor={i === 0 || chat.messages[i - 1].from !== m.from}
            onOpen={onOpen}
          />
        ))}
        {chat.typing && (
          <p className="tm-typing">
            {PEOPLE[chat.typing].name.split(' ')[0]} est en train d'écrire
            <span className="tm-typing__dots"><i /><i /><i /></span>
          </p>
        )}
        <div ref={end} />
      </div>
      <Composer onSend={onSend} />
    </section>
  )
}
