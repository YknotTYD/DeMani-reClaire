import Icon from './icons'
import { PEOPLE } from './data'
import TmAvatar from './TmAvatar'

/** Fil d'activité : notifications de Trajectoires et des collègues. */
export default function ActivityView({ items, onItem }) {
  return (
    <aside className="tm-list tm-list--wide">
      <div className="tm-list__head">
        <h2>Activité</h2>
        <span className="tm-list__tools"><Icon name="filter" size={18} /></span>
      </div>
      {items.map((a) => (
        <button key={a.id} type="button" className={`tm-activity ${a.unread ? 'is-unread' : ''}`} onClick={() => onItem(a)}>
          <TmAvatar person={PEOPLE[a.from]} size={36} presence={null} />
          <span className="tm-list__text">
            <span className="tm-list__title">
              {a.title}
              <span className="tm-list__time">{a.time}</span>
            </span>
            <span className="tm-list__preview">{a.text}</span>
          </span>
        </button>
      ))}
    </aside>
  )
}
