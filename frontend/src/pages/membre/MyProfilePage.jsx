import { useState } from 'react'
import { getMyProfile, listMySignals, markSignal, sendRequest } from '../../api/me'
import { listMyQuestionnaires } from '../../api/questionnaires'
import AsyncContent from '../../components/common/AsyncContent'
import ErrorMessage from '../../components/common/ErrorMessage'
import SearchableList from '../../components/common/SearchableList'
import AccessLogList from '../../components/profile/AccessLogList'
import MyResults from '../../components/profile/MyResults'
import ProfileSummary from '../../components/profile/ProfileSummary'
import RequestForm from '../../components/profile/RequestForm'
import SignalList from '../../components/profile/SignalList'
import { useAction } from '../../hooks/useAction'
import { useAsync } from '../../hooks/useAsync'
import { formatDate } from '../../utils/dates'

const REQUEST_LABELS = { echange: 'Échange', correction: 'Correction' }

/**
 * Le profil du collaborateur, vu par lui (rapport, annexe C) :
 * ses informations, ses résultats (avant tout partage), ses signaux, ses demandes, et qui a consulté son profil.
 */
export default function MyProfilePage() {
  const profile = useAsync(getMyProfile)
  const signals = useAsync(listMySignals)
  const questionnaires = useAsync(listMyQuestionnaires)
  const { run, error } = useAction()
  const [sent, setSent] = useState(false)
  const [prefill, setPrefill] = useState(null)

  const send = async (kind, message) => {
    const ok = await run(() => sendRequest(kind, message))
    if (ok) {
      setSent(true)
      setPrefill(null)
      profile.reload()
    }
    return ok
  }

  return (
    <>
      <h1>Mon profil</h1>
      <ErrorMessage message={error} />

      <div className="columns">
        <section className="panel">
          <h2>Ce que la banque sait de mon parcours</h2>
          <p className="muted">Lu dans les outils de la banque. Une erreur ? Demande une correction : elle sera faite dans le SIRH.</p>
          <AsyncContent {...profile}>{(p) => <ProfileSummary profile={p} />}</AsyncContent>
        </section>

        <section className="panel" id="demande">
          <h2>Solliciter mon gestionnaire RH</h2>
          {sent && <p className="success">Demande envoyée. Ton gestionnaire RH reviendra vers toi.</p>}
          <RequestForm
            key={prefill ? prefill.message : 'vide'}
            onSend={send}
            initialKind={prefill?.kind}
            initialMessage={prefill?.message}
          />
          <AsyncContent {...profile}>
            {(p) =>
              p.requests.length > 0 && (
                <ul className="soft-list soft-list--compact request-history">
                  {p.requests.map((r) => (
                    <li key={r.id}>
                      <div className="soft-list__main">
                        <span>
                          {REQUEST_LABELS[r.kind]} · {formatDate(r.created_at)}
                        </span>
                        {r.message && <span className="muted">« {r.message} »</span>}
                      </div>
                      <span className={r.status === 'traitee' ? 'status status--retenu' : 'status status--nouveau'}>
                        {r.status === 'traitee' ? (r.kind === 'correction' ? 'Corrigée dans le SIRH' : 'Traitée') : 'En attente'}
                      </span>
                    </li>
                  ))}
                </ul>
              )
            }
          </AsyncContent>
        </section>
      </div>

      <section className="panel">
        <h2>Mes signaux</h2>
        <p className="muted">Visibles par toi seul.</p>
        <AsyncContent {...signals}>
          {(list) => (
            <SignalList
              signals={list}
              onAsk={(s) => {
                setPrefill({ kind: 'echange', message: `Suite à mes réponses (${s.period}), j'aimerais faire un point.` })
                document.getElementById('demande')?.scrollIntoView({ behavior: 'smooth' })
              }}
              onSeen={async (id) => (await run(() => markSignal(id, true))) && signals.reload()}
            />
          )}
        </AsyncContent>
      </section>

      <section className="panel">
        <h2>Mes résultats</h2>
        <p className="muted">Tu vois toutes tes réponses. Le RH ne voit que celles que tu choisis de partager.</p>
        <AsyncContent {...questionnaires}>{(list) => <MyResults questionnaires={list} />}</AsyncContent>
      </section>

      <section className="panel">
        <h2>Qui a consulté mon profil</h2>
        <AsyncContent {...profile}>
          {(p) => (
            <SearchableList items={p.access_log} getText={(e) => `${e.viewer_name} ${e.action}`}>
              {(visible) => <AccessLogList entries={visible} />}
            </SearchableList>
          )}
        </AsyncContent>
      </section>
    </>
  )
}
