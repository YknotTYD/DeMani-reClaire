import { getMemberBusy } from '../../api/appointments'
import { useAsync } from '../../hooks/useAsync'
import { addMinutes, formatTime, overlaps } from '../../utils/calendar'

/**
 * Créneaux occupés d'un membre sur une journée, sans leur contenu (vie privée).
 * Prévient si l'horaire choisi tombe sur un créneau occupé.
 */
export default function MemberDayAvailability({ memberId, date, time, durationMinutes, excludeAppointmentId }) {
  const busy = useAsync(
    // Le rendez-vous en cours de modification ne doit pas se signaler lui-même comme conflit
    () => getMemberBusy(memberId, `${date}T00:00:00`, addMinutes(`${date}T00:00:00`, 24 * 60), excludeAppointmentId),
    [memberId, date, excludeAppointmentId],
  )
  if (!busy.data) return null

  const periods = busy.data
  const start = `${date}T${time}:00`
  const end = addMinutes(start, Number(durationMinutes))
  const conflict = periods.some((p) => overlaps(start, end, p.starts_at, p.ends_at))

  return (
    <div className="availability">
      {periods.length === 0 ? (
        <p className="availability__free">✓ Libre toute la journée</p>
      ) : (
        <p>
          Occupé ce jour-là :{' '}
          {periods.map((p) => (
            <span key={p.starts_at} className="busy-chip">
              {formatTime(p.starts_at)} – {formatTime(p.ends_at)}
            </span>
          ))}
        </p>
      )}
      {conflict && <p className="error">⚠ Ce créneau chevauche un moment où le membre est occupé.</p>}
    </div>
  )
}
