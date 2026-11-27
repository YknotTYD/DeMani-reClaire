import { DOCUMENT_TYPES, labelOf } from '../../utils/recruitment'
import { formatDate } from '../../utils/dates'
import DeleteButton from '../common/DeleteButton'

export default function DocumentList({ documents, onDownload, onDelete }) {
  if (documents.length === 0) return <p className="muted">Aucun document.</p>

  return (
    <ul className="soft-list">
      {documents.map((doc) => (
        <li key={doc.id}>
          <span className="file-icon">{doc.filename.endsWith('.pdf') ? 'PDF' : 'DOC'}</span>
          <div className="soft-list__main">
            <button type="button" className="button--link" onClick={() => onDownload(doc)}>
              {doc.filename}
            </button>
            <span className="muted">
              {labelOf(DOCUMENT_TYPES, doc.doc_type)} · déposé le {formatDate(doc.uploaded_at)} · « {doc.original_name} »
            </span>
          </div>
          <DeleteButton confirmMessage={`Supprimer ${doc.filename} ?`} onDelete={() => onDelete(doc.id)} />
        </li>
      ))}
    </ul>
  )
}
