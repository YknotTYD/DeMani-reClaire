export const WEEK_DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

const pad = (n) => String(n).padStart(2, '0')

/** Date -> « 2026-12-03 » (jour local) */
export const toDayKey = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

/** Date -> « 2026-12-03T10:00:00 » (heure locale, format attendu par l'API) */
export const toLocalIso = (date) => `${toDayKey(date)}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`

/** « 2026-12-03T10:00:00 » -> Date locale */
export const parseLocal = (iso) => new Date(iso)

/** Les 6 semaines affichées pour un mois (commence un lundi). */
export function monthGrid(year, month) {
  const first = new Date(year, month, 1)
  const offset = (first.getDay() + 6) % 7 // lundi = 0
  const start = new Date(year, month, 1 - offset)
  return Array.from({ length: 42 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i))
}

export const monthLabel = (year, month) =>
  new Date(year, month, 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

export const formatTime = (iso) => parseLocal(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

export const formatDateTime = (iso) =>
  parseLocal(iso).toLocaleString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })

/** Valeurs du formulaire de rendez-vous (vide ou à partir d'un rendez-vous existant). */
export function appointmentForm({ appointment, day, kind = 'candidat', personId, category = 'suivi' } = {}) {
  if (appointment) {
    const [date, time] = appointment.starts_at.split('T')
    return {
      kind: appointment.kind,
      personId: String(appointment.kind === 'membre' ? appointment.member_id : appointment.candidate_id),
      date,
      time: time.slice(0, 5),
      durationMinutes: appointment.duration_minutes,
      location: appointment.location,
      note: appointment.note,
      category: appointment.category,
    }
  }
  return {
    kind,
    personId: personId ? String(personId) : '',
    date: toDayKey(day ?? new Date()),
    time: '10:00',
    durationMinutes: 60,
    location: '',
    note: '',
    category,
  }
}

/** Deux créneaux se chevauchent-ils ? (dates au format local « 2026-12-03T10:00:00 ») */
export function overlaps(startA, endA, startB, endB) {
  return parseLocal(startA) < parseLocal(endB) && parseLocal(startB) < parseLocal(endA)
}

export const addMinutes = (iso, minutes) => toLocalIso(new Date(parseLocal(iso).getTime() + minutes * 60000))
