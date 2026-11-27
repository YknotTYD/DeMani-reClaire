export const QUARTERS = [
  { value: 1, label: 'Jan – Mar' },
  { value: 2, label: 'Avr – Juin' },
  { value: 3, label: 'Juil – Sep' },
  { value: 4, label: 'Oct – Déc' },
]

export const quarterOf = (date = new Date()) => Math.floor(date.getMonth() / 3) + 1

/**
 * Regroupe des questionnaires par trimestre, du plus récent au plus ancien.
 * Chaque élément doit avoir `year`, `quarter` et `label` (« Oct – Déc 2026 »).
 */
export function groupByQuarter(items) {
  const groups = new Map()
  for (const item of items) {
    const key = `${item.year}-${item.quarter}`
    if (!groups.has(key)) groups.set(key, { key, label: item.label, year: item.year, quarter: item.quarter, items: [] })
    groups.get(key).items.push(item)
  }
  return [...groups.values()].sort((a, b) => b.year - a.year || b.quarter - a.quarter)
}
