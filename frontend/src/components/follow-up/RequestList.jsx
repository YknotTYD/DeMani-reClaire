import { Link } from 'react-router-dom'
import { formatDate } from '../../utils/dates'
import SourceBadge from '../connectors/SourceBadge'

const KINDS = { echange: 'Demande un échange', correction: 'Demande une correction du profil' }

/** Demandes faites par les collaborateurs eux-mêmes. */
export default function RequestList({ requests, onToggle }) {
  if (requests.length === 0) return <p className="muted">Aucune demande.</p>

  return (
    <ul className="alert-list">
      {requests.map((r) => (
        <li key={r.id} className={r.status === 'traitee' ? 'alert alert--seen' : 'alert alert--request'}>
          <div className="alert__header">
            <Link to={`/membres/${r.member_id}`}>{r.member_name}</Link>
            <span className="muted">
              {KINDS[r.kind]} · {formatDate(r.created_at)}
            </span>
            <button type="button" className="button--link" onClick={() => onToggle(r)}>
              {r.status === 'traitee' ? 'Rouvrir' : r.kind === 'correction' ? 'Valider et transmettre au SIRH' : 'Marquer comme traitée'}
            </button>
          </div>
          {r.message && <p className="request-message">« {r.message} »</p>}
          {r.kind === 'correction' && r.status === 'traitee' && (
            <p className="muted">
              <SourceBadge source="sirh" /> Correction transmise au SIRH.
            </p>
          )}
        </li>
      ))}
    </ul>
  )
}
