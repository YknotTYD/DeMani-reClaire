const DAY = 24 * 3600 * 1000

/** Jours restants avant la suppression automatique d'un dossier de candidat (null : candidat retenu). */
export function daysLeft(candidate, now = new Date()) {
  if (!candidate.expires_at) return null
  const iso = /[zZ]|[+-]\d{2}:\d{2}$/.test(candidate.expires_at) ? candidate.expires_at : `${candidate.expires_at}Z`
  return Math.ceil((new Date(iso) - now) / DAY)
}

export const retentionLabel = (candidate) => {
  const days = daysLeft(candidate)
  if (days === null) return 'Retenu : conservé pour son suivi'
  const date = new Date(/Z|[+-]\d{2}:\d{2}$/.test(candidate.expires_at) ? candidate.expires_at : `${candidate.expires_at}Z`)
  return `Suppression prévue le ${date.toLocaleDateString('fr-FR')}`
}

export const EXPIRING_SOON_DAYS = 30
