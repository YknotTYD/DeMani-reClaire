import { relationKind } from '../../utils/relations'

/**
 * Liste des liens de travail.
 * - `membersById` : { id: membre } pour afficher les noms
 * - `focusId` : si fourni, la phrase est tournée du point de vue de ce membre
 */
export default function RelationList({ relations, membersById, focusId, onDelete }) {
  if (relations.length === 0) return <p className="muted">Aucun lien enregistré.</p>

  const nameOf = (id) => membersById[id]?.name ?? `Membre #${id}`

  return (
    <ul className="simple-list">
      {relations.map((r) => {
        const kind = relationKind(r.kind)
        let label = `${nameOf(r.member_a_id)} ${kind.verb} ${nameOf(r.member_b_id)}`
        if (focusId !== undefined && kind.directed && r.member_b_id === focusId) {
          label = `Accompagné(e) par ${nameOf(r.member_a_id)}`
        } else if (focusId !== undefined) {
          const other = r.member_a_id === focusId ? r.member_b_id : r.member_a_id
          label = `${kind.directed ? `${kind.label} de` : kind.verb.charAt(0).toUpperCase() + kind.verb.slice(1)} ${nameOf(other)}`
        }
        return (
          <li key={r.id}>
            <span className={`link-kind link-kind--${r.kind}`}>{kind.label}</span>
            <span>{label}</span>
            {onDelete && (
              <button type="button" className="button--link" onClick={() => onDelete(r.id)}>
                Supprimer
              </button>
            )}
          </li>
        )
      })}
    </ul>
  )
}
