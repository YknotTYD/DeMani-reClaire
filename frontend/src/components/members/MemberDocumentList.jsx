import { formatDate } from '../../utils/dates'
import DeleteButton from '../common/DeleteButton'

/** PDF déposés par un membre. `onDelete` seulement pour le membre lui-même. */
export default function MemberDocumentList({ documents, appointmentsById = {}, onDownload, onDelete }) {
  if (documents.length === 0) return <p className="muted">Aucun document.</p>

  return (
    <ul className="soft-list">
      {documents.map((doc) => {
        const appointment = appointmentsById[doc.appointment_id]
        return (
          <li key={doc.id}>
            <span className="file-icon">PDF</span>
            <div className="soft-list__main">
              <button type="button" className="button--link" onClick={() => onDownload(doc)}>
                {doc.filename}
              </button>
              <span className="muted">
                déposé le {formatDate(doc.uploaded_at)}
                {appointment && ` · joint au rendez-vous du ${appointment}`}
              </span>
            </div>
            {onDelete && <DeleteButton confirmMessage={`Supprimer ${doc.filename} ?`} onDelete={() => onDelete(doc.id)} />}
          </li>
        )
      })}
    </ul>
  )
}
