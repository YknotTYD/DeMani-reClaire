import { WEEK_DAYS, monthGrid, toDayKey } from '../../utils/calendar'
import { coversDay } from '../../utils/absences'
import AbsenceChip from '../absences/AbsenceChip'
import AppointmentChip from './AppointmentChip'

/** Vue d'un mois. Cliquer sur un jour pour ajouter un rendez-vous, sur un rendez-vous pour le modifier. Les absences (hors refusées) s'y affichent aussi. */
export default function MonthCalendar({ year, month, appointments, absences = [], selectedDay, onDayClick, onAppointmentClick }) {
  const todayKey = toDayKey(new Date())
  const byDay = {}
  for (const a of appointments) (byDay[a.starts_at.slice(0, 10)] ??= []).push(a)

  return (
    <div className="calendar">
      {WEEK_DAYS.map((d) => (
        <div key={d} className="calendar__weekday">
          {d}
        </div>
      ))}
      {monthGrid(year, month).map((day) => {
        const key = toDayKey(day)
        const classes = ['calendar__day']
        if (day.getMonth() !== month) classes.push('calendar__day--other')
        if (key === todayKey) classes.push('calendar__day--today')
        if (key === selectedDay) classes.push('calendar__day--selected')

        return (
          <div key={key} className={classes.join(' ')} onClick={() => onDayClick(day)}>
            <span className="calendar__number">{day.getDate()}</span>
            {absences
              .filter((a) => a.status !== 'refusee' && coversDay(a, key) && day.getDay() !== 0 && day.getDay() !== 6)
              .map((a) => (
                <AbsenceChip key={`absence-${a.id}`} absence={a} />
              ))}
            {(byDay[key] ?? []).map((a) => (
              <AppointmentChip key={a.id} appointment={a} onClick={onAppointmentClick} />
            ))}
          </div>
        )
      })}
    </div>
  )
}
