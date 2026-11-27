import { Link } from 'react-router-dom'
import Avatar from '../common/Avatar'
import Linkify from '../common/Linkify'
import { daysLeft, EXPIRING_SOON_DAYS, retentionLabel } from '../../utils/retention'
import StatusBadge from './StatusBadge'

export default function CandidateList({ candidates }) {
  if (candidates.length === 0) return <p className="muted">Aucun candidat pour ce poste.</p>

  return (
    <ul className="soft-list">
      {candidates.map((c) => (
        <li key={c.id}>
          <Avatar name={c.name} />
          <div className="soft-list__main">
            <Link to={`/candidats/${c.id}`}>{c.name}</Link>
            {c.email && (
              <span className="muted">
                <Linkify text={c.email} />
              </span>
            )}
            <span className={daysLeft(c) !== null && daysLeft(c) <= EXPIRING_SOON_DAYS ? 'retention retention--soon' : 'retention'}>
              {retentionLabel(c)}
            </span>
          </div>
          <StatusBadge status={c.status} />
        </li>
      ))}
    </ul>
  )
}
