import { formatDateTime, formatTime } from '../../utils/calendar'

export default function BusySlotList({ slots, onDelete }) {
  if (slots.length === 0) return <p className="muted">Aucune indisponibilité à venir.</p>

  return (
    <ul className="soft-list">
      {slots.map((s) => (
        <li key={s.id}>
          <span className="date-dot date-dot--busy" />
          <div className="soft-list__main">
            <span>
              {formatDateTime(s.starts_at)} → {formatTime(s.ends_at)}
            </span>
            {s.label && <span className="muted">{s.label}</span>}
          </div>
          <button type="button" className="button--link" onClick={() => onDelete(s.id)}>
            Retirer
          </button>
        </li>
      ))}
    </ul>
  )
}
