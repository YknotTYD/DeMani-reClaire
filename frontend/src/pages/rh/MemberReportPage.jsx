import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { createAppointment, deleteAppointment, listAppointments } from '../../api/appointments'
import { downloadMemberDocument } from '../../api/me'
import { getMember, listMemberDocuments, listMembers } from '../../api/members'
import { listAnsweredBy } from '../../api/questionnaires'
import { listMemberRelations } from '../../api/relations'
import AppointmentForm from '../../components/calendar/AppointmentForm'
import AppointmentList from '../../components/calendar/AppointmentList'
import AsyncContent from '../../components/common/AsyncContent'
import ErrorMessage from '../../components/common/ErrorMessage'
import SearchableList from '../../components/common/SearchableList'
import SourceBadge from '../../components/connectors/SourceBadge'
import MemberDocumentList from '../../components/members/MemberDocumentList'
import MemberQuestionnaires from '../../components/members/MemberQuestionnaires'
import RelationList from '../../components/relations/RelationList'
import { useAction } from '../../hooks/useAction'
import { useAsync } from '../../hooks/useAsync'
import { appointmentForm, formatDateTime } from '../../utils/calendar'

/** Rapport d'un membre : questionnaires (courbes + détail), rendez-vous, documents, relations. */
export default function MemberReportPage() {
  const memberId = Number(useParams().memberId)
  const member = useAsync(() => getMember(memberId), [memberId])
  const answered = useAsync(() => listAnsweredBy(memberId), [memberId])
  const appointments = useAsync(() => listAppointments({ memberId }), [memberId])
  const documents = useAsync(() => listMemberDocuments(memberId), [memberId])
  const relations = useAsync(() => listMemberRelations(memberId), [memberId])
  const allMembers = useAsync(listMembers)
  const { run, error } = useAction()
  const [planning, setPlanning] = useState(false)

  // Les plus récents d'abord : à venir et en cours en tête, puis l'historique
  const sortedAppointments = [...(appointments.data ?? [])].sort((a, b) => b.starts_at.localeCompare(a.starts_at))
  const appointmentLabels = Object.fromEntries((appointments.data ?? []).map((a) => [a.id, formatDateTime(a.starts_at)]))

  return (
    <AsyncContent {...member}>
      {(m) => (
        <>
          <h1>Rapport — {m.name}</h1>
          <p className="notice notice--privacy">
            Cette consultation est enregistrée dans le journal du collaborateur, qui peut voir qui a consulté son profil.
          </p>
          <div className="profile-line">
            <span className="muted">{m.email}</span>
            <span>
              {m.hired_on ? `Embauché le ${new Date(m.hired_on).toLocaleDateString('fr-FR')}` : "Date d'embauche absente du SIRH"}
            </span>
            <SourceBadge source="sirh" />
          </div>
          <ErrorMessage message={error} />

          <section className="panel">
            <h2>Questionnaires</h2>
            <AsyncContent {...answered}>{(list) => <MemberQuestionnaires memberId={memberId} answered={list} />}</AsyncContent>
          </section>

          <div className="columns">
            <section className="panel">
              <div className="panel__header">
                <h2>Rendez-vous</h2>
                {!planning && (
                  <button type="button" onClick={() => setPlanning(true)}>
                    Proposer un rendez-vous
                  </button>
                )}
              </div>
              {planning && (
                <AppointmentForm
                  initial={appointmentForm({ kind: 'membre', personId: memberId })}
                  lockPerson
                  onCancel={() => setPlanning(false)}
                  onSave={async (values) => {
                    if (await run(() => createAppointment(values))) {
                      setPlanning(false)
                      appointments.reload()
                    }
                  }}
                />
              )}
              <SearchableList items={sortedAppointments} getText={(a) => `${a.location} ${a.note} ${a.starts_at}`}>
                {(visible) => (
                  <AppointmentList
                    appointments={visible}
                    showPerson={false}
                    onDelete={async (id) => (await run(() => deleteAppointment(id))) && appointments.reload()}
                    emptyText="Aucun rendez-vous."
                  />
                )}
              </SearchableList>
            </section>

            <section className="panel">
              <h2>Documents déposés</h2>
              <AsyncContent {...documents}>
                {(list) => (
                  <SearchableList items={list} getText={(d) => d.filename}>
                    {(visible) => (
                      <MemberDocumentList
                        documents={visible}
                        appointmentsById={appointmentLabels}
                        onDownload={(doc) => run(() => downloadMemberDocument(doc))}
                      />
                    )}
                  </SearchableList>
                )}
              </AsyncContent>
            </section>
          </div>

          <section className="panel">
            <h2>Liens de travail</h2>
            <AsyncContent {...relations}>
              {(list) => {
                const membersById = Object.fromEntries((allMembers.data ?? []).map((x) => [x.id, x]))
                return (
                  <SearchableList
                    items={list}
                    getText={(r) => membersById[r.member_a_id === memberId ? r.member_b_id : r.member_a_id]?.name}
                  >
                    {(visible) => <RelationList relations={visible} focusId={memberId} membersById={membersById} />}
                  </SearchableList>
                )
              }}
            </AsyncContent>
          </section>
        </>
      )}
    </AsyncContent>
  )
}
