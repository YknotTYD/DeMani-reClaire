import { useState } from 'react'
import { answerTypeLabel } from '../../utils/criteria'
import DeleteButton from '../common/DeleteButton'
import InlineForm from '../common/InlineForm'

/** Une ligne ou une colonne du tableau. Pour une colonne : son type de réponse et son caractère obligatoire. */
export default function CriterionItem({ criterion: c, onRename, onDelete, onToggleRequired }) {
  const [editing, setEditing] = useState(false)
  const isColumn = c.axis === 'column'

  if (editing) {
    return (
      <li>
        <InlineForm
          initialValue={c.label}
          buttonLabel="Valider"
          onSubmit={async (label) => {
            const ok = await onRename(c.id, label)
            if (ok) setEditing(false)
            return ok
          }}
        />
        <button type="button" className="button--link" onClick={() => setEditing(false)}>
          Annuler
        </button>
      </li>
    )
  }

  return (
    <li className="criterion-item">
      <div className="soft-list__main">
        <span className="criterion-item__label">{c.label}</span>
        {isColumn && (
          <span className="muted">
            {answerTypeLabel(c.answer_type)}
            {c.answer_type === 'choice' && ` : ${c.options.join(', ')}`}
            {c.answer_type === 'number' && (c.min_value !== null || c.max_value !== null) && ` (${c.min_value ?? '…'} à ${c.max_value ?? '…'})`}
          </span>
        )}
      </div>
      {isColumn && (
        <button
          type="button"
          className={c.required ? 'chip chip--small chip--on' : 'chip chip--small'}
          onClick={() => onToggleRequired(c)}
          title="Cliquer pour changer"
        >
          {c.required ? 'Obligatoire' : 'Facultatif'}
        </button>
      )}
      <button type="button" className="button--link" onClick={() => setEditing(true)}>
        Renommer
      </button>
      <DeleteButton
        confirmMessage={`Supprimer « ${c.label} » ? Les réponses données dans cette ${isColumn ? 'colonne' : 'ligne'} seront supprimées.`}
        onDelete={() => onDelete(c.id)}
      />
    </li>
  )
}
