import { groupByQuarter } from '../../utils/quarters'

/**
 * Questionnaires rangés par trimestre (Oct – Déc 2026, Juil – Sep 2026…).
 * Seul le trimestre le plus récent est déplié ; les autres se déplient au clic.
 */
export default function QuarterGroups({ items, renderItems, emptyText = 'Aucun questionnaire pour le moment.' }) {
  const groups = groupByQuarter(items)
  if (groups.length === 0) return <p className="muted">{emptyText}</p>

  return (
    <div className="quarter-groups">
      {groups.map((group, index) => (
        <details key={group.key} className="quarter" open={index === 0}>
          <summary>
            <span className="quarter__label">{group.label}</span>
            <span className="muted">
              {group.items.length} questionnaire{group.items.length > 1 ? 's' : ''}
            </span>
          </summary>
          {renderItems(group.items)}
        </details>
      ))}
    </div>
  )
}
