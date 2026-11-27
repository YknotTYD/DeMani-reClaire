import { cellKey } from '../../utils/criteria'
import AnswerInput from './AnswerInput'
import AnswerValue from './AnswerValue'

/** Indication sous le nom d'une colonne : bornes d'un nombre, caractère facultatif. */
function ColumnHint({ column }) {
  const hints = []
  if (column.answer_type === 'number' && (column.min_value !== null || column.max_value !== null)) {
    hints.push(`de ${column.min_value ?? '…'} à ${column.max_value ?? '…'}`)
  }
  if (!column.required) hints.push('facultatif')
  if (hints.length === 0) return null
  return <span className="column-hint">{hints.join(' · ')}</span>
}

/**
 * Tableau d'un questionnaire : lignes (Mon poste, Mon équipe…) x colonnes.
 * Chaque colonne a son type de réponse. `values` : { "rowId-columnId": valeur }.
 * Lecture seule si `onChange` n'est pas fourni.
 */
export default function AnswerGrid({ rows, columns, values, onChange }) {
  if (rows.length === 0 || columns.length === 0) {
    return <p className="muted">Le tableau n'a pas encore de lignes ou de colonnes (à définir dans le modèle du questionnaire).</p>
  }

  return (
    <div className="table-scroll">
      <table className="table answer-grid">
        <thead>
          <tr>
            <th />
            {columns.map((col) => (
              <th key={col.id}>
                {col.label}
                <ColumnHint column={col} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <th scope="row">{row.label}</th>
              {columns.map((col) => {
                const key = cellKey(row.id, col.id)
                return (
                  <td key={col.id}>
                    {onChange ? (
                      <AnswerInput
                        column={col}
                        value={values[key]}
                        label={`${row.label} — ${col.label}`}
                        onChange={(value) => onChange(key, value)}
                      />
                    ) : (
                      <AnswerValue column={col} value={values[key]} />
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
