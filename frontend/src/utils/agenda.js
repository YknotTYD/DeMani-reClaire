import { parseLocal } from './calendar'

/** Réponse du membre à un rendez-vous proposé. */
export const APPOINTMENT_STATUSES = {
  propose: 'En attente de réponse',
  accepte: 'Accepté',
  refuse: 'Refusé',
}

/** Nature d'un rendez-vous avec un membre : sert aux rappels « n'oublier personne ». */
export const APPOINTMENT_CATEGORIES = [
  { value: 'suivi', label: 'Point de suivi' },
  { value: 'parcours', label: 'Entretien de parcours pro' },
  { value: 'integration', label: "Bilan d'intégration" },
]

export const categoryLabel = (value) =>
  value === 'recrutement' ? 'Entretien de recrutement' : APPOINTMENT_CATEGORIES.find((c) => c.value === value)?.label ?? value

/** Où en est le rendez-vous dans le temps. */
export const TIME_STATUSES = {
  a_venir: 'À venir',
  en_cours: 'En cours',
  passe: 'Passé',
}

export function timeStatus(appointment, now = new Date()) {
  const start = parseLocal(appointment.starts_at)
  const end = new Date(start.getTime() + appointment.duration_minutes * 60000)
  if (now < start) return 'a_venir'
  if (now < end) return 'en_cours'
  return 'passe'
}
