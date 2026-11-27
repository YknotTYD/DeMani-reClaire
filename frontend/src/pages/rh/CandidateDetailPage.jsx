import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createAppointment, deleteAppointment, listAppointments } from '../../api/appointments'
import { deleteCandidate, getCandidate, updateCandidate } from '../../api/candidates'
import { deleteDocument, downloadDocument } from '../../api/documents'
import AppointmentForm from '../../components/calendar/AppointmentForm'
import AppointmentList from '../../components/calendar/AppointmentList'
import CandidateInfoForm from '../../components/candidates/CandidateInfoForm'
import DocumentList from '../../components/candidates/DocumentList'
import StatusBadge from '../../components/candidates/StatusBadge'
import AsyncContent from '../../components/common/AsyncContent'
import DeleteButton from '../../components/common/DeleteButton'
import ErrorMessage from '../../components/common/ErrorMessage'
import SearchableList from '../../components/common/SearchableList'
import { useAction } from '../../hooks/useAction'
import { useAsync } from '../../hooks/useAsync'
import { appointmentForm } from '../../utils/calendar'
import { retentionLabel } from '../../utils/retention'

export default function CandidateDetailPage() {
  const candidateId = Number(useParams().candidateId)
  const navigate = useNavigate()
  const candidate = useAsync(() => getCandidate(candidateId), [candidateId])
  const appointments = useAsync(() => listAppointments({ candidateId }), [candidateId])
  const { run, error } = useAction()
  const [addingAppointment, setAddingAppointment] = useState(false)

  const act = async (action, ...toReload) => {
    const ok = await run(action)
    if (ok) toReload.forEach((r) => r.reload())
    return ok
  }

  return (
    <AsyncContent {...candidate}>
      {(c) => (
        <>
          <div className="page-header">
            <h1>
              {c.name} <StatusBadge status={c.status} />
            </h1>
            <DeleteButton
              label="Supprimer le candidat"
              confirmMessage={`Supprimer ${c.name}, ses rendez-vous et son dossier de fichiers ?`}
              onDelete={async () => (await run(() => deleteCandidate(candidateId))) && navigate('/candidats')}
            />
          </div>
          <p className="muted">
            {c.position_name} / {c.name} · {retentionLabel(c)}
          </p>
          <ErrorMessage message={error} />

          <div className="columns">
            <section className="panel">
              <h2>Informations</h2>
              <CandidateInfoForm
                key={`${c.name}-${c.email}-${c.status}`}
                candidate={c}
                onSave={(form) => act(() => updateCandidate(candidateId, form), candidate, appointments)}
              />
            </section>

            <section className="panel">
              <h2>Documents</h2>
              <SearchableList items={c.documents} getText={(d) => `${d.filename} ${d.original_name}`}>
                {(visible) => (
                  <DocumentList
                    documents={visible}
                    onDownload={(doc) => run(() => downloadDocument(doc))}
                    onDelete={(id) => act(() => deleteDocument(id), candidate)}
                  />
                )}
              </SearchableList>
            </section>
          </div>

          <section className="panel">
            <div className="panel__header">
              <h2>Rendez-vous</h2>
              {!addingAppointment && (
                <button type="button" onClick={() => setAddingAppointment(true)}>
                  Planifier un rendez-vous
                </button>
              )}
            </div>
            {addingAppointment && (
              <AppointmentForm
                initial={appointmentForm({ kind: 'candidat', personId: candidateId })}
                lockPerson
                onCancel={() => setAddingAppointment(false)}
                onSave={async (values) => {
                  if (await act(() => createAppointment(values), appointments)) setAddingAppointment(false)
                }}
              />
            )}
            <AsyncContent {...appointments}>
              {(list) => (
                <SearchableList items={list} getText={(a) => `${a.location} ${a.note} ${a.starts_at}`}>
                  {(visible) => (
                    <AppointmentList
                      appointments={visible}
                      showPerson={false}
                      onDelete={(id) => act(() => deleteAppointment(id), appointments)}
                    />
                  )}
                </SearchableList>
              )}
            </AsyncContent>
          </section>
        </>
      )}
    </AsyncContent>
  )
}
