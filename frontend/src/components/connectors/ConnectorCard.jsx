import { formatDateTime } from '../../utils/calendar'
import { VERSIONS, ZONES } from '../../utils/sources'
import SourceBadge from './SourceBadge'

/** Un système de la banque relié à Trajectoires : ce qu'il apporte, ce qu'on lit, ce qu'on lui renvoie. */
export default function ConnectorCard({ connector, onSync, syncing }) {
  const connected = connector.status === 'connecte'
  return (
    <li className={`connector ${connected ? 'connector--on' : 'connector--planned'}`}>
      <div className="connector__head">
        <SourceBadge source={connector.id} />
        <h3>{connector.name}</h3>
        <span className={connected ? 'status status--retenu' : 'status status--nouveau'}>
          {connected ? 'Relié' : 'Prévu'}
        </span>
      </div>
      <p>{connector.role}</p>
      <dl className="connector__facts">
        <dt>Lit</dt>
        <dd>{connector.reads.join(', ')}</dd>
        <dt>Renvoie</dt>
        <dd>{connector.writes.join(', ')}</dd>
        <dt>Cadre</dt>
        <dd>
          {VERSIONS[connector.version]} · {ZONES[connector.zone]}
        </dd>
      </dl>
      <div className="connector__foot">
        {connected ? (
          <>
            <span className="muted">
              {connector.items} {connector.count_label} · synchronisé le {formatDateTime(connector.last_sync_at)}
            </span>
            <button type="button" className="button--ghost" onClick={() => onSync(connector.id)} disabled={syncing}>
              Synchroniser
            </button>
          </>
        ) : (
          <span className="muted">Branché avec la version 2, après accord du groupe.</span>
        )}
      </div>
    </li>
  )
}
