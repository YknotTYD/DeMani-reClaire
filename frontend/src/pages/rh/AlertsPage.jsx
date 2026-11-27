import { notifyAlertsChanged } from '../../api/alerts'
import { listEvolutions, updateEvolution } from '../../api/evolutions'
import { getReminders, listContactRequests, updateContactRequest } from '../../api/followUp'
import AsyncContent from '../../components/common/AsyncContent'
import ErrorMessage from '../../components/common/ErrorMessage'
import SourceBadge from '../../components/connectors/SourceBadge'
import SearchableList from '../../components/common/SearchableList'
import EvolutionList from '../../components/evolutions/EvolutionList'
import ContactIndicator from '../../components/follow-up/ContactIndicator'
import ReminderList from '../../components/follow-up/ReminderList'
import RequestList from '../../components/follow-up/RequestList'
import { useAction } from '../../hooks/useAction'
import { useAsync } from '../../hooks/useAsync'

/**
 * Alertes, version conforme au rapport :
 * - des rappels sur des faits (échéances, absence d'échange), jamais sur l'état d'esprit d'une personne ;
 * - les demandes que les collaborateurs choisissent de faire ;
 * - les souhaits d'évolution exprimés.
 */
export default function AlertsPage() {
  const reminders = useAsync(getReminders)
  const requests = useAsync(listContactRequests)
  const evolutions = useAsync(listEvolutions)
  const { run, error } = useAction()

  const act = async (action, list) => {
    const ok = await run(action)
    if (ok) {
      list.reload()
      notifyAlertsChanged()
    }
    return ok
  }

  return (
    <>
      <h1>Alertes</h1>
      <ErrorMessage message={error} />

      <section className="panel">
        <div className="title-row">
          <h2>N'oublier personne</h2>
          <SourceBadge source="crm_rh" />
        </div>
        <p className="muted">
          Alertes remontées par le CRM RH, calculées à partir de faits datés : échéances de l'entretien de parcours professionnel, jalons d'intégration,
          absence d'échange depuis 12 mois. Aucune note ni interprétation.
        </p>
        <AsyncContent {...reminders}>
          {(data) => (
            <>
              <ContactIndicator indicator={data.indicator} />
              <SearchableList items={data.reminders} getText={(r) => `${r.member_name} ${r.label}`} getName={(r) => r.member_name} alphabetical>
                {(visible) => <ReminderList reminders={visible} />}
              </SearchableList>
            </>
          )}
        </AsyncContent>
      </section>

      <section className="panel">
        <h2>Demandes des collaborateurs</h2>
        <p className="muted">
          Échanges et corrections demandés par les collaborateurs eux-mêmes, depuis leur profil. Une correction validée est
          transmise au SIRH, qui reste la source.
        </p>
        <AsyncContent {...requests}>
          {(list) => (
            <SearchableList items={list} getText={(r) => `${r.member_name} ${r.message}`}>
              {(visible) => (
                <RequestList
                  requests={visible}
                  onToggle={(r) => act(() => updateContactRequest(r.id, r.status === 'traitee' ? 'nouvelle' : 'traitee'), requests)}
                />
              )}
            </SearchableList>
          )}
        </AsyncContent>
      </section>

      <section className="panel">
        <div className="title-row">
          <h2>Souhaits d'évolution</h2>
          <SourceBadge source="sirh" />
        </div>
        <p className="muted">
          Exprimés dans le questionnaire, en sachant que le gestionnaire RH en est informé, et enregistrés dans les champs
          dédiés du SIRH.
        </p>
        <AsyncContent {...evolutions}>
          {(list) => (
            <SearchableList items={list} getText={(e) => `${e.member_name} ${e.period} ${e.note}`}>
              {(visible) => (
                <EvolutionList
                  evolutions={visible}
                  onSave={(id, status, note) => act(() => updateEvolution(id, status, note), evolutions)}
                />
              )}
            </SearchableList>
          )}
        </AsyncContent>
      </section>
    </>
  )
}
