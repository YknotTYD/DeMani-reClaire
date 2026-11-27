import { ABSENCE_STATUSES } from '../../utils/absences'

export default function AbsenceStatusBadge({ status }) {
  return <span className={`absence-status absence-status--${status}`}>{ABSENCE_STATUSES[status]}</span>
}
