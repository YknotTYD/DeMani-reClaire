import { downloadMemberDocument } from '../../api/me'
import { formatDateTime } from '../../utils/calendar'
import AppointmentStatus from '../calendar/AppointmentStatus'
import FileDropZone from '../common/FileDropZone'
import Linkify from '../common/Linkify'

/** Un rendez-vous vu par le membre : accepter / refuser, et joindre des PDF pour le préparer. */
export default function MyAppointmentCard({ appointment: a, onRespond, onAttach }) {
  return (
    <article className={`result-card result-card--${a.status}`}>
      <header className="result-card__header">
        <div className="soft-list__main">
          <strong>{formatDateTime(a.starts_at)}</strong>
          <span className="muted">
            {a.duration_minutes} min
            {a.location && (
              <>
                {' · '}
                <Linkify text={a.location} />
              </>
            )}
          </span>
        </div>
        <AppointmentStatus appointment={a} />
      </header>

      {a.note && (
        <p>
          <Linkify text={a.note} />
        </p>
      )}

      <div className="form-row">
        {a.status !== 'accepte' && (
          <button type="button" onClick={() => onRespond(a.id, true)}>
            Accepter
          </button>
        )}
        {a.status !== 'refuse' && (
          <button type="button" className="button--danger" onClick={() => onRespond(a.id, false)}>
            Refuser
          </button>
        )}
      </div>

      {a.documents.length > 0 && (
        <p className="attached">
          <span className="muted">Pièce jointe :</span>{' '}
          {a.documents.map((doc) => (
            <button key={doc.id} type="button" className="button--link" onClick={() => downloadMemberDocument(doc)}>
              {doc.filename}
            </button>
          ))}
        </p>
      )}
      {a.status !== 'refuse' && (
        <FileDropZone
          accept=".pdf"
          label="Joindre un PDF à ce rendez-vous"
          buttonLabel="Choisir un PDF"
          onFiles={(files) => onAttach(files, a.id)}
        />
      )}
    </article>
  )
}
