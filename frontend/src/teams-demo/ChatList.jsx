import Icon from './icons'
import { PEOPLE } from './data'
import TmAvatar from './TmAvatar'

const preview = (chat) => {
  const last = chat.messages[chat.messages.length - 1]
  if (!last) return ''
  const text = last.card ? last.card.title : last.text
  return last.from === 'me' ? `Vous : ${text}` : text
}

/** Liste des conversations, avec dernier message et non-lus. */
export default function ChatList({ chats, selected, onSelect }) {
  return (
    <aside className="tm-list">
      <div className="tm-list__head">
        <h2>Conversation</h2>
        <span className="tm-list__tools">
          <Icon name="filter" size={18} />
          <Icon name="edit" size={18} />
        </span>
      </div>
      <p className="tm-list__section">Épinglées</p>
      {chats.map((chat, i) => (
        <div key={chat.id}>
          {i === 1 && <p className="tm-list__section">Récentes</p>}
          <button
            type="button"
            className={`tm-list__item ${selected === chat.id ? 'is-active' : ''} ${chat.unread ? 'is-unread' : ''}`}
            onClick={() => onSelect(chat.id)}
          >
            {chat.group ? <TmAvatar group={chat.group} size={32} /> : <TmAvatar person={PEOPLE[chat.with]} size={32} />}
            <span className="tm-list__text">
              <span className="tm-list__title">
                {chat.title}
                <span className="tm-list__time">{chat.messages[chat.messages.length - 1]?.time.split(' ').pop()}</span>
              </span>
              <span className="tm-list__preview">{preview(chat)}</span>
            </span>
          </button>
        </div>
      ))}
    </aside>
  )
}
