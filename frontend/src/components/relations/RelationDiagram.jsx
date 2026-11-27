const DIRECTED = new Set(['tuteur', 'parrain'])

const WIDTH = 560
const HEIGHT = 420
const NODE_RADIUS = 26

/** Place les membres en cercle. */
function circleLayout(members) {
  const cx = WIDTH / 2
  const cy = HEIGHT / 2
  const radius = members.length > 1 ? Math.min(WIDTH, HEIGHT) / 2 - NODE_RADIUS - 30 : 0
  return Object.fromEntries(
    members.map((m, i) => {
      const angle = (2 * Math.PI * i) / members.length - Math.PI / 2
      return [m.id, { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) }]
    }),
  )
}

const initials = (name) =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

/**
 * Carte des liens de travail d'une équipe : tuteur et parrain (flèche vers la personne accompagnée),
 * binôme, remplaçant. Aucune note sur les relations.
 * Cliquer sur un membre met en avant ses liens.
 */
export default function RelationDiagram({ members, relations, selectedId, onSelect }) {
  if (members.length === 0) return <p className="muted">Ajoute des membres pour voir le diagramme.</p>

  const positions = circleLayout(members)
  const isLinkedToSelected = (r) => r.member_a_id === selectedId || r.member_b_id === selectedId

  return (
    <svg className="diagram" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label="Carte des liens de travail">
      <defs>
        {['tuteur', 'parrain'].map((kind) => (
          <marker key={kind} id={`arrow-${kind}`} viewBox="0 0 10 10" refX="34" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M0 0 L10 5 L0 10 Z" className={`diagram__arrow diagram__arrow--${kind}`} />
          </marker>
        ))}
      </defs>
      {relations.map((r) => {
        const a = positions[r.member_a_id]
        const b = positions[r.member_b_id]
        if (!a || !b) return null
        const dimmed = selectedId !== null && !isLinkedToSelected(r)
        return (
          <g key={r.id} className={`diagram__edge diagram__edge--${r.kind}${dimmed ? ' diagram__edge--dimmed' : ''}`}>
            <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} strokeWidth={3} markerEnd={DIRECTED.has(r.kind) ? `url(#arrow-${r.kind})` : undefined} />
          </g>
        )
      })}

      {members.map((m) => {
        const { x, y } = positions[m.id]
        const selected = m.id === selectedId
        return (
          <g
            key={m.id}
            className={selected ? 'diagram__node diagram__node--selected' : 'diagram__node'}
            onClick={() => onSelect(selected ? null : m.id)}
          >
            <circle cx={x} cy={y} r={NODE_RADIUS} />
            <text x={x} y={y + 5} className="diagram__initials">
              {initials(m.name)}
            </text>
            <text x={x} y={y + NODE_RADIUS + 16} className="diagram__name">
              {m.name}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
