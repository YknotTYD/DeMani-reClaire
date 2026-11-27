import { APPOINTMENT_STATUSES, TIME_STATUSES, timeStatus } from '../../utils/agenda'

/**
 * Statuts d'un rendez-vous :
 * - dans le temps : à venir, en cours, passé ;
 * - avec un membre : sa réponse (en attente, accepté, refusé).
 */
export default function AppointmentStatus({ appointment }) {
  const time = timeStatus(appointment)
  return (
    <span className="status-group">
      <span className={`status status--time-${time}`}>{TIME_STATUSES[time]}</span>
      {appointment.kind === 'membre' && (
        <span className={`status status--rdv-${appointment.status}`}>{APPOINTMENT_STATUSES[appointment.status]}</span>
      )}
    </span>
  )
}
