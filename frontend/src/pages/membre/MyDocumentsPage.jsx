import { deleteMyDocument, downloadMemberDocument, listMyAppointments, listMyDocuments, uploadMyDocument } from '../../api/me'
import AsyncContent from '../../components/common/AsyncContent'
import ErrorMessage from '../../components/common/ErrorMessage'
import FileDropZone from '../../components/common/FileDropZone'
import SearchableList from '../../components/common/SearchableList'
import MemberDocumentList from '../../components/members/MemberDocumentList'
import { useAction } from '../../hooks/useAction'
import { useAsync } from '../../hooks/useAsync'
import { formatDateTime } from '../../utils/calendar'

/** Le membre dépose des PDF ; les RH peuvent les consulter. */
export default function MyDocumentsPage() {
  const documents = useAsync(listMyDocuments)
  const appointments = useAsync(listMyAppointments)
  const { run, error } = useAction()

  const upload = async (files) => {
    if (await run(async () => {
      for (const file of files) await uploadMyDocument(file)
    }))
      documents.reload()
  }

  const appointmentLabels = Object.fromEntries((appointments.data ?? []).map((a) => [a.id, formatDateTime(a.starts_at)]))

  return (
    <>
      <h1>Mes documents</h1>
      <p className="muted">Les PDF déposés ici sont visibles par toi et par les RH.</p>
      <section className="panel">
        <FileDropZone accept=".pdf" label="Glisse ici un ou plusieurs PDF" buttonLabel="Choisir des PDF" onFiles={upload} />
        <ErrorMessage message={error} />
        <AsyncContent {...documents}>
          {(list) => (
            <SearchableList items={list} getText={(d) => d.filename}>
              {(visible) => (
                <MemberDocumentList
                  documents={visible}
                  appointmentsById={appointmentLabels}
                  onDownload={(doc) => run(() => downloadMemberDocument(doc))}
                  onDelete={async (id) => (await run(() => deleteMyDocument(id))) && documents.reload()}
                />
              )}
            </SearchableList>
          )}
        </AsyncContent>
      </section>
    </>
  )
}
