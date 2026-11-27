import { Link } from 'react-router-dom'
import { downloadMemberDocument } from '../../api/me'
import { categoryLabel, timeStatus } from '../../utils/agenda'
import { formatDateTime } from '../../utils/calendar'
import DeleteButton from '../common/DeleteButton'
import Linkify from '../common/Linkify'
import AppointmentStatus from './AppointmentStatus'

const personLink = (a) => (a.kind === 'membre' ? `/membres/${a.member_id}` : `/candidats/${a.candidate_id}`)

/**
 * Liste de rendez-vous (vue RH).
 * - `showPerson` : afficher avec qui (inutile sur la fiche de la personne)
 * - `onSelect` : ouvrir le rendez-vous pour le modifier
 * - `onDelete` : bouton de suppression
 */
export default function AppointmentList({ appointments, showPerson = true, onSelect, onDelete, emptyText = 'Aucun rendez-vous.' }) {
  if (appointments.length === 0) return <p className="muted">{emptyText}</p>

  return (
    <ul className="soft-list appointment-list">
      {appointments.map((a) => (
        <li key={a.id} className={`appointment-item appointment-item--${timeStatus(a)}`}>
          <span className={`date-dot date-dot--${a.kind}`} />
          <div className="soft-list__main">
            <button type="button" className="button--link" onClick={() => onSelect?.(a)} disabled={!onSelect}>
              {formatDateTime(a.starts_at)} · {a.duration_minutes} min
            </button>
            <span className="appointment-item__category">{categoryLabel(a.category)}</span>
            {showPerson && (
              <span className="muted">
                <Link to={personLink(a)}>{a.person_name}</Link>
                {a.position_name ? ` (candidat · ${a.position_name})` : ' (membre)'}
              </span>
            )}
            {a.location && (
              <span className="appointment-item__line">
                <Linkify text={a.location} />
              </span>
            )}
            {a.note && (
              <span className="appointment-item__line muted">
                <Linkify text={a.note} />
              </span>
            )}
            {a.documents.length > 0 && (
              <span className="attached">
                <span className="muted">Pièce jointe :</span>{' '}
                {a.documents.map((doc) => (
                  <button key={doc.id} type="button" className="button--link" onClick={() => downloadMemberDocument(doc)}>
                    {doc.filename}
                  </button>
                ))}
              </span>
            )}
          </div>
          <AppointmentStatus appointment={a} />
          {onDelete && (
            <DeleteButton
              label="Supprimer"
              confirmMessage={`Supprimer le rendez-vous du ${formatDateTime(a.starts_at)} avec ${a.person_name} ?`}
              onDelete={() => onDelete(a.id)}
            />
          )}
        </li>
      ))}
    </ul>
  )
}
