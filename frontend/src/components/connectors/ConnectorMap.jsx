import SourceBadge from './SourceBadge'

/** Schéma : Trajectoires au centre, ouvert dans Teams, relié aux outils existants de la banque. */
export default function ConnectorMap({ connectors }) {
  const systems = connectors.filter((c) => c.id !== 'teams')
  return (
    <div className="connector-map" aria-label="Trajectoires s'ouvre dans Teams et se branche sur les outils de la banque">
      <div className="connector-map__teams">
        <SourceBadge source="teams" />
        <span>Trajectoires s'ouvre dans Teams</span>
      </div>
      <div className="connector-map__core">Trajectoires</div>
      <ul className="connector-map__systems">
        {systems.map((c) => (
          <li key={c.id} className={c.status === 'connecte' ? '' : 'is-planned'}>
            <SourceBadge source={c.id} />
            <span>{c.name}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
