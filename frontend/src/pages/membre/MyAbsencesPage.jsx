import { useState } from 'react'
import { cancelAbsence, declareAbsence, listMyAbsences } from '../../api/absences'
import { listMyAppointments } from '../../api/me'
import AbsenceCard from '../../components/absences/AbsenceCard'
import AbsenceForm from '../../components/absences/AbsenceForm'
import AgendaWeek from '../../components/absences/AgendaWeek'
import WeekNav from '../../components/absences/WeekNav'
import AsyncContent from '../../components/common/AsyncContent'
import ErrorMessage from '../../components/common/ErrorMessage'
import SearchableList from '../../components/common/SearchableList'
import { useAction } from '../../hooks/useAction'
import { useAsync } from '../../hooks/useAsync'
import { ABSENCE_KINDS, formatPeriod } from '../../utils/absences'
import { toDayKey } from '../../utils/calendar'

const mondayOf = (date) => {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7))
  return d
}

/** Le collaborateur voit sa semaine en vue agenda et déclare ses absences ; le RH les retrouve sans recevoir d'email. */
export default function MyAbsencesPage() {
  const [weekStart, setWeekStart] = useState(mondayOf(new Date()))
  const [formDay, setFormDay] = useState(null)
  const absences = useAsync(listMyAbsences)
  const appointments = useAsync(listMyAppointments)
  const { run, error, pending } = useAction()

  const declare = async (values) => {
    if (await run(() => declareAbsence(values))) {
      setFormDay(null)
      absences.reload()
    }
  }

  return (
    <>
      <h1>Mes absences</h1>
      <p className="muted lead">
        Ton RH retrouve tes absences dans son agenda, sans email. Seuls toi et le RH voyez les justificatifs.
      </p>
      <ErrorMessage message={error} />
      <div className="calendar-layout">
        <section className="panel">
          <WeekNav weekStart={weekStart} onChange={(d) => setWeekStart(mondayOf(d ?? new Date()))} />
          <AgendaWeek
            weekStart={weekStart}
            absences={absences.data ?? []}
            appointments={appointments.data ?? []}
            onDayClick={setFormDay}
          />
        </section>

        <aside>
          <section className="panel">
            <h2>Déclarer une absence</h2>
            {formDay ? (
              <AbsenceForm key={formDay} initialDay={formDay} onSubmit={declare} onCancel={() => setFormDay(null)} pending={pending} />
            ) : (
              <>
                <p className="muted">Choisis un jour dans l'agenda, ou commence aujourd'hui.</p>
                <button type="button" onClick={() => setFormDay(toDayKey(new Date()))}>
                  Nouvelle absence
                </button>
              </>
            )}
          </section>

          <section className="panel">
            <h2>Historique</h2>
            <AsyncContent {...absences}>
              {(list) =>
                list.length === 0 ? (
                  <p className="muted">Aucune absence déclarée.</p>
                ) : (
                  <SearchableList items={list} getText={(a) => `${ABSENCE_KINDS[a.kind].label} ${formatPeriod(a)} ${a.comment}`}>
                    {(visible) => (
                      <ul className="absence-list">
                        {visible.map((a) => (
                          <AbsenceCard key={a.id} absence={a}>
                            {a.status === 'en_attente' && (
                              <button
                                type="button"
                                className="text-link"
                                onClick={async () => (await run(() => cancelAbsence(a.id))) && absences.reload()}
                              >
                                Annuler cette absence
                              </button>
                            )}
                          </AbsenceCard>
                        ))}
                      </ul>
                    )}
                  </SearchableList>
                )
              }
            </AsyncContent>
          </section>
        </aside>
      </div>
    </>
  )
}
