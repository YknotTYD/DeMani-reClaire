import { useState } from 'react'
import { listAbsences } from '../../api/absences'
import { createAppointment, deleteAppointment, listAppointments, updateAppointment } from '../../api/appointments'
import AppointmentForm from '../../components/calendar/AppointmentForm'
import AppointmentList from '../../components/calendar/AppointmentList'
import MonthCalendar from '../../components/calendar/MonthCalendar'
import MonthNav from '../../components/calendar/MonthNav'
import AsyncContent from '../../components/common/AsyncContent'
import ErrorMessage from '../../components/common/ErrorMessage'
import SearchableList from '../../components/common/SearchableList'
import { useAction } from '../../hooks/useAction'
import { useAsync } from '../../hooks/useAsync'
import { usePeople } from '../../hooks/usePeople'
import { appointmentForm, formatDateTime, monthGrid, toDayKey, toLocalIso } from '../../utils/calendar'

export default function CalendarPage() {
  const now = new Date()
  const [{ year, month }, setMonth] = useState({ year: now.getFullYear(), month: now.getMonth() })
  // null : rien d'ouvert ; { day } : nouveau rendez-vous ; { appointment } : modification
  const [editing, setEditing] = useState(null)

  const grid = monthGrid(year, month)
  const rangeStart = toLocalIso(grid[0])
  const rangeEnd = toLocalIso(new Date(grid[41].getFullYear(), grid[41].getMonth(), grid[41].getDate() + 1))

  const appointments = useAsync(() => listAppointments({ start: rangeStart, end: rangeEnd }), [rangeStart, rangeEnd])
  const upcoming = useAsync(() => listAppointments({ start: toLocalIso(new Date()) }))
  const absences = useAsync(() => listAbsences({ start: rangeStart.slice(0, 10), end: rangeEnd.slice(0, 10) }), [rangeStart, rangeEnd])
  const people = usePeople()
  const { run, error } = useAction()

  const act = async (action) => {
    const ok = await run(action)
    if (ok) {
      appointments.reload()
      upcoming.reload()
      setEditing(null)
    }
  }

  const selectedDay = editing?.day ? toDayKey(editing.day) : editing?.appointment?.starts_at.slice(0, 10)

  return (
    <>
      <h1>Calendrier</h1>
      <ErrorMessage message={error} />
      <div className="calendar-layout">
        <section className="panel">
          <MonthNav year={year} month={month} onChange={(y, m) => setMonth({ year: y, month: m })} />
          <MonthCalendar
            year={year}
            month={month}
            appointments={appointments.data ?? []}
            absences={absences.data ?? []}
            selectedDay={selectedDay}
            onDayClick={(day) => setEditing({ day })}
            onAppointmentClick={(appointment) => setEditing({ appointment })}
          />
          <p className="legend">
            <span className="legend__item">
              <span className="legend__swatch date-dot--membre" /> Membre
            </span>
            <span className="legend__item">
              <span className="legend__swatch date-dot--candidat" /> Candidat
            </span>
            <span className="legend__item">
              <span className="legend__swatch legend__swatch--absence" /> Absence (pointillés : à traiter)
            </span>
            <span className="legend__item">« ? » en attente de réponse du membre</span>
          </p>
        </section>

        <aside>
          {editing && (
            <section className="panel">
              <h2>{editing.appointment ? 'Modifier le rendez-vous' : `Nouveau rendez-vous`}</h2>
              {editing.appointment && <p className="muted">{formatDateTime(editing.appointment.starts_at)}</p>}
              <AsyncContent {...people}>
                {(list) => (
                  <AppointmentForm
                    key={editing.appointment?.id ?? toDayKey(editing.day)}
                    initial={appointmentForm({ ...editing, kind: 'membre' })}
                    people={list}
                    editing={editing.appointment}
                    onCancel={() => setEditing(null)}
                    onSave={(values) =>
                      act(() =>
                        editing.appointment ? updateAppointment(editing.appointment.id, values) : createAppointment(values),
                      )
                    }
                    onDelete={editing.appointment && (() => act(() => deleteAppointment(editing.appointment.id)))}
                  />
                )}
              </AsyncContent>
            </section>
          )}

          <section className="panel">
            <h2>À venir</h2>
            <AsyncContent {...upcoming}>
              {(list) => (
                <SearchableList items={list} getText={(a) => `${a.person_name} ${a.location}`} placeholder="Rechercher un rendez-vous…">
                  {(visible) => (
                    <AppointmentList
                      appointments={visible}
                      onSelect={(appointment) => setEditing({ appointment })}
                      onDelete={(id) => act(() => deleteAppointment(id))}
                      emptyText="Aucun rendez-vous à venir. Clique sur un jour pour en ajouter un."
                    />
                  )}
                </SearchableList>
              )}
            </AsyncContent>
          </section>
        </aside>
      </div>
    </>
  )
}
