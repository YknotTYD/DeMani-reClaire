import { ABSENCE_KINDS, coversDay } from '../../utils/absences'
import { formatTime, toDayKey } from '../../utils/calendar'
import AbsenceStatusBadge from './AbsenceStatusBadge'

/** Vue agenda : une ligne par jour de la semaine, avec les absences et les rendez-vous. Cliquer un jour pour déclarer. */
export default function AgendaWeek({ weekStart, absences, appointments, onDayClick }) {
  const today = toDayKey(new Date())
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + i)
    return d
  })

  return (
    <ol className="agenda">
      {days.map((day) => {
        const key = toDayKey(day)
        const dayAbsences = absences.filter((a) => coversDay(a, key) && a.status !== 'refusee')
        const dayAppointments = appointments.filter((a) => a.starts_at.slice(0, 10) === key)
        const weekend = day.getDay() === 0 || day.getDay() === 6
        return (
          <li key={key} className={`agenda__day ${key === today ? 'is-today' : ''} ${weekend ? 'is-weekend' : ''}`}>
            <button type="button" className="agenda__date" onClick={() => onDayClick(key)} title="Déclarer une absence ce jour-là">
              <span>{day.toLocaleDateString('fr-FR', { weekday: 'long' })}</span>
              <strong>{day.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}</strong>
            </button>
            <div className="agenda__items">
              {dayAbsences.map((a) => (
                <span key={`a${a.id}`} className={`agenda__item agenda__item--absence agenda__item--${a.status}`}>
                  Absence · {ABSENCE_KINDS[a.kind].label}
                  {key === a.start_date && a.start_afternoon && ' (après-midi)'}
                  {key === a.end_date && a.end_morning && ' (matin)'}
                  <AbsenceStatusBadge status={a.status} />
                </span>
              ))}
              {dayAppointments.map((a) => (
                <span key={`r${a.id}`} className="agenda__item agenda__item--appointment">
                  {formatTime(a.starts_at)} · Rendez-vous RH{a.location ? ` · ${a.location}` : ''}
                </span>
              ))}
              {dayAbsences.length + dayAppointments.length === 0 && !weekend && (
                <span className="agenda__empty">Rien de prévu</span>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
