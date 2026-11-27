import { splitCriteria } from './criteria'

const MAX_SERIES = 5

const mean = (values) => (values.length ? values.reduce((a, b) => a + b, 0) / values.length : null)

/**
 * Transforme l'évolution d'un modèle en courbes : une courbe par colonne (Moral, Motivation…),
 * pour une ligne choisie (Travail, Perso…) ou la moyenne de toutes les lignes (`rowId` = null).
 * La couleur suit la colonne (sa position dans le tableau), pas son rang : filtrer ne repeint rien.
 */
export function evolutionSeries(evolution, rowId) {
  const { rows, columns: allColumns } = splitCriteria(evolution.criteria)
  // Seules les colonnes en étoiles se suivent sur une même échelle de 1 à 5
  const columns = allColumns.filter((c) => c.answer_type === 'stars')
  const rowIds = rowId ? [rowId] : rows.map((r) => r.id)

  const series = columns.slice(0, MAX_SERIES).map((column, colorIndex) => ({
    key: column.id,
    name: column.label,
    colorIndex,
    values: evolution.points.map((point) => {
      const cells = point.cells.filter((c) => c.column_id === column.id && rowIds.includes(c.row_id))
      const value = mean(cells.map((c) => c.average))
      return value === null ? null : Math.round(value * 100) / 100
    }),
  }))

  return { labels: evolution.points.map((p) => p.label), series, hiddenColumns: Math.max(0, columns.length - MAX_SERIES) }
}
