import { useState } from 'react'
import { decideAbsence, listAbsences } from '../../api/absences'
import AbsenceCard from '../../components/absences/AbsenceCard'
import AbsenceDecision from '../../components/absences/AbsenceDecision'
import AsyncContent from '../../components/common/AsyncContent'
import ChipGroup from '../../components/common/ChipGroup'
import ErrorMessage from '../../components/common/ErrorMessage'
import SearchableList from '../../components/common/SearchableList'
import { useAction } from '../../hooks/useAction'
import { useAsync } from '../../hooks/useAsync'
import { ABSENCE_KINDS, formatPeriod } from '../../utils/absences'

const FILTERS = [
  { value: 'en_attente', label: 'À traiter' },
  { value: 'validee', label: 'Validées' },
  { value: 'refusee', label: 'Refusées' },
  { value: '', label: 'Toutes' },
]

/** Les absences déclarées arrivent ici et sur le calendrier, au lieu d'arriver par email. */
export default function AbsencesPage() {
  const [filter, setFilter] = useState('en_attente')
  const absences = useAsync(() => listAbsences({ status: filter }), [filter])
  const { run, error, setError } = useAction()

  return (
    <>
      <h1>Absences</h1>
      <p className="muted lead">
        Les absences déclarées par les collaborateurs arrivent ici et sur ton calendrier, sans email. Consulter un
        justificatif est inscrit dans le journal du collaborateur.
      </p>
      <ErrorMessage message={error} />
      <ChipGroup label="Filtrer les absences" options={FILTERS} value={filter} onChange={setFilter} />
      <section className="panel">
        <AsyncContent {...absences}>
          {(list) =>
            list.length === 0 ? (
              <p className="muted">Aucune absence {filter ? FILTERS.find((f) => f.value === filter).label.toLowerCase() : ''}.</p>
            ) : (
              <SearchableList
                items={list}
                getText={(a) => `${a.member_name} ${ABSENCE_KINDS[a.kind].label} ${formatPeriod(a)}`}
                placeholder="Rechercher un collaborateur…"
              >
                {(visible) => (
                  <ul className="absence-list absence-list--grid">
                    {visible.map((a) => (
                      <AbsenceCard key={a.id} absence={a} showName onError={setError}>
                        <AbsenceDecision
                          key={a.status}
                          absence={a}
                          onDecide={async (id, status, comment) => (await run(() => decideAbsence(id, status, comment))) && absences.reload()}
                        />
                      </AbsenceCard>
                    ))}
                  </ul>
                )}
              </SearchableList>
            )
          }
        </AsyncContent>
      </section>
    </>
  )
}
