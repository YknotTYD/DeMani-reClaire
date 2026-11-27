import { Link } from 'react-router-dom'
import { downloadDocument } from '../../api/documents'
import { formatDateTime } from '../../utils/calendar'
import { formatDate } from '../../utils/dates'
import { DOCUMENT_TYPES, labelOf } from '../../utils/recruitment'
import StatusBadge from '../candidates/StatusBadge'
import Avatar from '../common/Avatar'
import Linkify from '../common/Linkify'

/** Fiche résumée d'un candidat trouvé : poste, statut, contact, documents, prochain rendez-vous. */
export default function CandidateResult({ candidate: c }) {
  return (
    <article className="result-card">
      <header className="result-card__header">
        <Avatar name={c.name} />
        <div className="soft-list__main">
          <Link to={`/candidats/${c.id}`} className="card__title">
            {c.name}
          </Link>
          <span className="muted">
            {c.position_name} · {c.email ? <Linkify text={c.email} /> : 'pas d’email'} · dossier créé le {formatDate(c.created_at)}
          </span>
        </div>
        <StatusBadge status={c.status} />
      </header>

      <div className="result-card__body">
        <div>
          <p className="form-label">Documents</p>
          {c.documents.length === 0 ? (
            <p className="muted">Aucun.</p>
          ) : (
            <div className="chip-group">
              {c.documents.map((doc) => (
                <button key={doc.id} type="button" className="chip" onClick={() => downloadDocument(doc)} title={labelOf(DOCUMENT_TYPES, doc.doc_type)}>
                  ⬇ {doc.filename}
                </button>
              ))}
            </div>
          )}
        </div>
        <div>
          <p className="form-label">Prochain rendez-vous</p>
          <p>{c.next_appointment ? formatDateTime(c.next_appointment) : <span className="muted">Aucun de prévu</span>}</p>
        </div>
      </div>
    </article>
  )
}
