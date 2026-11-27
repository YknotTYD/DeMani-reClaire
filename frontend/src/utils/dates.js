/** Le backend renvoie des dates UTC sans fuseau : on l'ajoute avant de les afficher en heure locale. */
export function formatDate(isoString) {
  const hasTimezone = /[zZ]|[+-]\d{2}:\d{2}$/.test(isoString)
  const date = new Date(hasTimezone ? isoString : `${isoString}Z`)
  return date.toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })
}
