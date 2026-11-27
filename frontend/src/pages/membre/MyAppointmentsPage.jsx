import { addBusySlot, deleteBusySlot, listMyAppointments, listMyBusySlots, respondToAppointment, uploadMyDocument } from '../../api/me'
import BusySlotForm from '../../components/agenda/BusySlotForm'
import BusySlotList from '../../components/agenda/BusySlotList'
import MyAppointmentCard from '../../components/agenda/MyAppointmentCard'
import AsyncContent from '../../components/common/AsyncContent'
import ErrorMessage from '../../components/common/ErrorMessage'
import SearchableList from '../../components/common/SearchableList'
import { useAction } from '../../hooks/useAction'
import { useAsync } from '../../hooks/useAsync'

/** Le membre voit ses prochains rendez-vous, y répond, y joint des PDF, et bloque ses indisponibilités. */
export default function MyAppointmentsPage() {
  const appointments = useAsync(listMyAppointments)
  const busy = useAsync(listMyBusySlots)
  const { run, error } = useAction()

  const act = async (action, ...toReload) => {
    const ok = await run(action)
    if (ok) toReload.forEach((r) => r.reload())
    return ok
  }

  const attach = (files, appointmentId) =>
    act(async () => {
      for (const file of files) await uploadMyDocument(file, appointmentId)
    }, appointments)

  return (
    <>
      <h1>Mes rendez-vous</h1>
      <ErrorMessage message={error} />

      <AsyncContent {...appointments}>
        {(list) => {
          const pending = list.filter((a) => a.status === 'propose').length
          return (
            <>
              {pending > 0 && (
                <p className="notice">
                  {pending} rendez-vous attend{pending > 1 ? 'ent' : ''} ta réponse.
                </p>
              )}
              {list.length === 0 ? (
                <p className="muted">Aucun rendez-vous à venir.</p>
              ) : (
                <SearchableList items={list} getText={(a) => `${a.location} ${a.note} ${a.starts_at}`}>
                  {(visible) => (
                    <div className="results">
                      {visible.map((a) => (
                        <MyAppointmentCard
                          key={a.id}
                          appointment={a}
                          onRespond={(id, accept) => act(() => respondToAppointment(id, accept), appointments)}
                          onAttach={attach}
                        />
                      ))}
                    </div>
                  )}
                </SearchableList>
              )}
            </>
          )
        }}
      </AsyncContent>

      <section className="panel">
        <h2>Mes indisponibilités</h2>
        <p className="muted">Le RH voit seulement que tu es occupé, jamais le détail.</p>
        <div className="columns">
          <BusySlotForm onAdd={(slot) => act(() => addBusySlot(slot), busy)} />
          <AsyncContent {...busy}>
            {(list) => (
              <SearchableList items={list} getText={(s) => `${s.label} ${s.starts_at}`}>
                {(visible) => <BusySlotList slots={visible} onDelete={(id) => act(() => deleteBusySlot(id), busy)} />}
              </SearchableList>
            )}
          </AsyncContent>
        </div>
      </section>
    </>
  )
}
