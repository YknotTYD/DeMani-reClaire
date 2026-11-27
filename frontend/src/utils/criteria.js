/** Les façons de répondre, choisies colonne par colonne. */
export const ANSWER_TYPES = [
  { value: 'stars', label: 'Étoiles (1 à 5)' },
  { value: 'number', label: 'Nombre' },
  { value: 'yes_no', label: 'Oui / Non' },
  { value: 'choice', label: 'Choix dans une liste' },
  { value: 'text', label: 'Texte libre' },
]

export const answerTypeLabel = (type) => ANSWER_TYPES.find((t) => t.value === type)?.label ?? type

/** Sépare les critères en lignes (Mon poste, Mon équipe…) et colonnes (Satisfaction, Charge…). */
export function splitCriteria(criteria) {
  return {
    rows: criteria.filter((c) => c.axis === 'row'),
    columns: criteria.filter((c) => c.axis === 'column'),
  }
}

export const cellKey = (rowId, columnId) => `${rowId}-${columnId}`

/** Une case est remplie si elle a une valeur (false compte : c'est la réponse « Non »). */
export const isFilled = (value) => value !== undefined && value !== null && !(typeof value === 'string' && !value.trim())

/** [{row_id, column_id, value}] -> { "rowId-columnId": value } */
export function answersToMap(answers) {
  return Object.fromEntries(answers.map((a) => [cellKey(a.row_id, a.column_id), a.value]))
}

/** { "rowId-columnId": value } -> [{row_id, column_id, value}], sans les cases vides */
export function mapToAnswers(values) {
  return Object.entries(values)
    .filter(([, value]) => isFilled(value))
    .map(([key, value]) => {
      const [row_id, column_id] = key.split('-').map(Number)
      return { row_id, column_id, value }
    })
}

/** Toutes les cases des colonnes obligatoires sont-elles remplies ? */
export function isComplete(rows, columns, values) {
  if (rows.length === 0 || columns.length === 0) return false
  return rows.every((r) => columns.every((c) => !c.required || isFilled(values[cellKey(r.id, c.id)])))
}
