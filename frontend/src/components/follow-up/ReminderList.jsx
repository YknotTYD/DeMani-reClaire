import { Link } from 'react-router-dom'
import Avatar from '../common/Avatar'

const KIND_LABELS = {
  sans_contact: 'Sans échange',
  parcours: 'Entretien de parcours',
  integration: 'Intégration',
}

/** Rappels fondés sur des faits datés : aucun score, aucune interprétation. */
export default function ReminderList({ reminders }) {
  if (reminders.length === 0) return <p className="muted">Personne n'est oublié : aucun rappel en attente.</p>

  return (
    <ul className="soft-list">
      {reminders.map((r, i) => (
        <li key={`${r.member_id}-${r.kind}-${i}`}>
          <Avatar name={r.member_name} />
          <div className="soft-list__main">
            <Link to={`/membres/${r.member_id}`}>{r.member_name}</Link>
            <span className="muted">{r.label}</span>
          </div>
          <span className={`status reminder--${r.kind}${r.overdue ? ' reminder--overdue' : ''}`}>
            {r.overdue ? 'En retard · ' : ''}
            {KIND_LABELS[r.kind]}
          </span>
          <Link to={`/membres/${r.member_id}`} className="button-link">
            Proposer un rendez-vous
          </Link>
        </li>
      ))}
    </ul>
  )
}
