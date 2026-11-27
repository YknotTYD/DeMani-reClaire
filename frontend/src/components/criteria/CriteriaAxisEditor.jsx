import InlineForm from '../common/InlineForm'
import ColumnForm from './ColumnForm'
import CriterionItem from './CriterionItem'

/**
 * Édition d'un axe du tableau.
 * Lignes : un simple nom. Colonnes : un nom et une façon de répondre (`onAddColumn`).
 */
export default function CriteriaAxisEditor({ title, placeholder, items, onAdd, onAddColumn, onRename, onDelete, onToggleRequired }) {
  return (
    <section className="panel">
      <h2>{title}</h2>
      {items.length === 0 ? (
        <p className="muted">Aucun élément.</p>
      ) : (
        <ul className="simple-list">
          {items.map((c) => (
            <CriterionItem key={c.id} criterion={c} onRename={onRename} onDelete={onDelete} onToggleRequired={onToggleRequired} />
          ))}
        </ul>
      )}
      {onAddColumn ? <ColumnForm onAdd={onAddColumn} /> : <InlineForm placeholder={placeholder} onSubmit={onAdd} />}
    </section>
  )
}
