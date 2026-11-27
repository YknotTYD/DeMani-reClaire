/** Types d'absence et justificatif demandé (même règle que le backend : services/absences.py). */
export const ABSENCE_KINDS = {
  maladie: {
    label: 'Maladie',
    proof: 'obligatoire',
    hint: "Joins uniquement le volet employeur de l'arrêt de travail : il ne mentionne pas le motif médical.",
  },
  conges: { label: 'Congés', proof: 'aucun', hint: 'Aucun justificatif à joindre.' },
  autre: { label: 'Autre', proof: 'facultatif', hint: 'Un justificatif peut être joint si tu en as un (convocation, attestation…).' },
}

export const ABSENCE_STATUSES = {
  en_attente: 'À traiter',
  validee: 'Validée',
  refusee: 'Refusée',
}

export const PROOF_ACCEPT = '.pdf,.jpg,.jpeg,.png'

const parseDay = (key) => {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export const formatDay = (key) =>
  parseDay(key).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })

/** « lun. 30 nov. (après-midi) » ou « du lun. 30 nov. au mer. 2 déc. (matin) » */
export function formatPeriod(a) {
  if (a.start_date === a.end_date) {
    const half = a.start_afternoon ? ' (après-midi)' : a.end_morning ? ' (matin)' : ''
    return `${formatDay(a.start_date)}${half}`
  }
  return `du ${formatDay(a.start_date)}${a.start_afternoon ? ' après-midi' : ''} au ${formatDay(a.end_date)}${a.end_morning ? ' midi' : ''}`
}

/** Jours ouvrés (lundi à vendredi), demi-journées déduites : même calcul que le backend. */
export function workingDays({ start_date, end_date, start_afternoon, end_morning }) {
  if (!start_date || !end_date || end_date < start_date) return 0
  let days = 0
  for (let d = parseDay(start_date); d <= parseDay(end_date); d.setDate(d.getDate() + 1)) {
    if (d.getDay() !== 0 && d.getDay() !== 6) days += 1
  }
  const weekday = (key) => ![0, 6].includes(parseDay(key).getDay())
  if (start_afternoon && weekday(start_date)) days -= 0.5
  if (end_morning && weekday(end_date)) days -= 0.5
  return days
}

export const daysLabel = (days) => `${String(days).replace('.', ',')} jour${days > 1 ? 's' : ''} ouvré${days > 1 ? 's' : ''}`

/** L'absence couvre-t-elle ce jour (clé AAAA-MM-JJ) ? */
export const coversDay = (a, key) => a.start_date <= key && key <= a.end_date
