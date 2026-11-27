import { APPOINTMENT_STATUSES, TIME_STATUSES, timeStatus } from '../../utils/agenda'
import { formatTime } from '../../utils/calendar'

export default function AppointmentChip({ appointment: a, onClick }) {
  const time = timeStatus(a)
  const detail = `${TIME_STATUSES[time]} · ${a.kind === 'membre' ? `membre · ${APPOINTMENT_STATUSES[a.status]}` : `candidat · ${a.position_name}`}`

  return (
    <button
      type="button"
      className={`appointment-chip appointment-chip--${a.kind} appointment-chip--${a.status} appointment-chip--${time}`}
      title={`${a.person_name} — ${detail}`}
      onClick={(e) => {
        e.stopPropagation()
        onClick(a)
      }}
    >
      <strong>{formatTime(a.starts_at)}</strong> {a.person_name}
      {a.status === 'propose' && ' ?'}
    </button>
  )
}
