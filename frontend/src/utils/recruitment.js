export const CANDIDATE_STATUSES = [
  { value: 'nouveau', label: 'Nouveau' },
  { value: 'entretien', label: 'Entretien' },
  { value: 'retenu', label: 'Retenu' },
  { value: 'refuse', label: 'Refusé' },
]

export const DOCUMENT_TYPES = [
  { value: 'cv', label: 'CV' },
  { value: 'lettre', label: 'Lettre de motivation' },
  { value: 'diplome', label: 'Diplôme' },
  { value: 'autre', label: 'Autre' },
]

export const ACCEPTED_FILES = '.pdf,.docx'

export const labelOf = (list, value) => list.find((item) => item.value === value)?.label ?? value

/** Devine le type de document d'après le nom du fichier (le RH peut changer). */
export function guessDocType(fileName) {
  const name = fileName.toLowerCase()
  if (name.includes('lettre') || name.includes('motivation') || name.includes('lm')) return 'lettre'
  if (name.includes('diplome') || name.includes('diplôme')) return 'diplome'
  return 'cv'
}
