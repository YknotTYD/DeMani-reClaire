import { RELATION_KINDS } from '../../utils/relations'

/** Légende de la carte des liens : chaque type a sa couleur et son trait. */
export default function RelationLegend() {
  return (
    <p className="legend">
      {RELATION_KINDS.map((k) => (
        <span key={k.value} className="legend__item">
          <span className={`legend__line link-line--${k.value}`} />
          {k.label}
          {k.directed && ' (→ personne accompagnée)'}
        </span>
      ))}
    </p>
  )
}
