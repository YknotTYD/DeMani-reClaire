import { ABSENCE_KINDS, daysLabel, formatPeriod } from '../../utils/absences'
import { formatDate } from '../../utils/dates'
import AbsenceStatusBadge from './AbsenceStatusBadge'
import ProofLinks from './ProofLinks'

/** Une absence : type, période, durée, statut, commentaires, justificatifs. `children` : actions (annuler, décider). */
export default function AbsenceCard({ absence: a, showName, onError, children }) {
  return (
    <li className={`absence-card absence-card--${a.kind}`}>
      <div className="absence-card__head">
        {showName && <strong>{a.member_name}</strong>}
        <span className={`absence-kind absence-kind--${a.kind}`}>{ABSENCE_KINDS[a.kind].label}</span>
        <AbsenceStatusBadge status={a.status} />
      </div>
      <p>
        {formatPeriod(a)} · {daysLabel(a.days)}
      </p>
      {a.comment && <p className="request-message">« {a.comment} »</p>}
      <ProofLinks documents={a.documents} onError={onError} />
      {a.rh_comment && (
        <p className="absence-card__rh">
          <span className="muted">Réponse RH :</span> {a.rh_comment}
        </p>
      )}
      <p className="muted absence-card__meta">
        Déclarée le {formatDate(a.created_at)}
        {a.decided_at && ` · traitée le ${formatDate(a.decided_at)}`}
      </p>
      {children}
    </li>
  )
}
