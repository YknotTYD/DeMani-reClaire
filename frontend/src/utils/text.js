/** Minuscules et sans accents : « Chloé » est trouvée en tapant « chloe ». */
export function normalize(text) {
  return (text ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
}

/** Tous les mots tapés doivent se retrouver dans le texte. */
export function matches(text, query) {
  const haystack = normalize(text)
  return normalize(query)
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => haystack.includes(word))
}

/** Première lettre (A–Z) d'un nom, sans accent. */
export function initialOf(text) {
  const letter = normalize(text).trim().charAt(0).toUpperCase()
  return /[A-Z]/.test(letter) ? letter : '#'
}

export const byName = (a, b) => (a ?? '').localeCompare(b ?? '', 'fr', { sensitivity: 'base' })
