import { listConnectors, syncConnector } from '../../api/connectors'
import AsyncContent from '../../components/common/AsyncContent'
import ErrorMessage from '../../components/common/ErrorMessage'
import ConnectorCard from '../../components/connectors/ConnectorCard'
import ConnectorMap from '../../components/connectors/ConnectorMap'
import { useAction } from '../../hooks/useAction'
import { useAsync } from '../../hooks/useAsync'

/** Les systèmes de la banque sur lesquels Trajectoires se branche, sans les remplacer (rapport, 4.2 et 5.6). */
export default function ConnectionsPage() {
  const connectors = useAsync(listConnectors)
  const { run, error, pending } = useAction()

  return (
    <>
      <h1>Connexions</h1>
      <p className="muted lead">
        Trajectoires n'est pas un outil de plus : il s'ouvre dans Teams et lit les outils déjà validés par le groupe.
        Les données restent dans leur système d'origine.
      </p>
      <ErrorMessage message={error} />
      <AsyncContent {...connectors}>
        {(list) => (
          <>
            {list[0]?.mode === 'demo' && (
              <p className="notice">Démonstration : les connecteurs lisent une base d'exemple, pas les vrais outils de la banque.</p>
            )}
            <section className="panel">
              <ConnectorMap connectors={list} />
            </section>
            <ul className="connector-list">
              {list.map((c) => (
                <ConnectorCard
                  key={c.id}
                  connector={c}
                  syncing={pending}
                  onSync={async (id) => (await run(() => syncConnector(id))) && connectors.reload()}
                />
              ))}
            </ul>
          </>
        )}
      </AsyncContent>
    </>
  )
}
