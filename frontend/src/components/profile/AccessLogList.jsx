import { formatDate } from '../../utils/dates'

/** « Qui a consulté mon profil » (rapport, annexe C : chaque consultation est journalisée). */
export default function AccessLogList({ entries }) {
  if (entries.length === 0) return <p className="muted">Personne n'a encore consulté ton profil.</p>

  return (
    <ul className="soft-list soft-list--compact">
      {entries.map((e, i) => (
        <li key={i}>
          <span className="date-dot date-dot--busy" />
          <div className="soft-list__main">
            <span>
              <strong>{e.viewer_name}</strong> · {e.action}
            </span>
            <span className="muted">{formatDate(e.at)}</span>
          </div>
        </li>
      ))}
    </ul>
  )
}
