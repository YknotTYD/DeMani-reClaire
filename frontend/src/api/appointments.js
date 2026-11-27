import { request } from './client'

// Les dates sont en heure locale, au format « 2026-12-03T10:00:00 »

export const listAppointments = ({ start, end, candidateId, memberId } = {}) => {
  const params = new URLSearchParams()
  if (start) params.set('start', start)
  if (end) params.set('end', end)
  if (candidateId) params.set('candidate_id', candidateId)
  if (memberId) params.set('member_id', memberId)
  return request(`/appointments?${params}`)
}

/** `a.kind` : 'candidat' ou 'membre' ; `a.personId` : l'id correspondant. */
const toBody = (a) => ({
  candidate_id: a.kind === 'candidat' ? Number(a.personId) : null,
  member_id: a.kind === 'membre' ? Number(a.personId) : null,
  starts_at: a.startsAt,
  duration_minutes: Number(a.durationMinutes),
  location: a.location,
  note: a.note,
  category: a.kind === 'membre' ? a.category ?? 'suivi' : 'recrutement',
})

export const createAppointment = (a) => request('/appointments', { method: 'POST', body: toBody(a) })
export const updateAppointment = (id, a) => request(`/appointments/${id}`, { method: 'PUT', body: toBody(a) })
export const deleteAppointment = (id) => request(`/appointments/${id}`, { method: 'DELETE' })

/** Créneaux occupés d'un membre (sans détail). */
export const getMemberBusy = (memberId, start, end, excludeAppointmentId) => {
  const params = new URLSearchParams({ start, end })
  if (excludeAppointmentId) params.set('exclude_appointment_id', excludeAppointmentId)
  return request(`/members/${memberId}/busy?${params}`)
}
