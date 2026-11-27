import { downloadFile, request } from './client'

// Espace du membre connecté

export const listMyAppointments = () => request('/me/appointments')
export const respondToAppointment = (id, accept) =>
  request(`/me/appointments/${id}/respond`, { method: 'POST', body: { accept } })

export const listMyBusySlots = () => request('/me/busy-slots')
export const addBusySlot = ({ startsAt, endsAt, label }) =>
  request('/me/busy-slots', { method: 'POST', body: { starts_at: startsAt, ends_at: endsAt, label } })
export const deleteBusySlot = (id) => request(`/me/busy-slots/${id}`, { method: 'DELETE' })

export const listMyDocuments = () => request('/me/documents')
export function uploadMyDocument(file, appointmentId) {
  const form = new FormData()
  form.append('file', file)
  if (appointmentId) form.append('appointment_id', appointmentId)
  return request('/me/documents', { method: 'POST', body: form })
}
export const deleteMyDocument = (id) => request(`/me/documents/${id}`, { method: 'DELETE' })

/** Fonctionne pour le membre (ses documents) et pour les RH. */
export const downloadMemberDocument = (doc) => downloadFile(`/member-documents/${doc.id}/download`, doc.filename)

// Profil, signaux et demandes (le collaborateur voit tout son profil et décide de solliciter le RH)
export const getMyProfile = () => request('/me/profile')
export const listMySignals = () => request('/me/signals')
export const markSignal = (id, seen) => request(`/me/signals/${id}`, { method: 'PATCH', body: { seen } })
/** `kind` : 'echange' (demander un échange) ou 'correction' (demander la correction du profil) */
export const sendRequest = (kind, message) => request('/me/contact-requests', { method: 'POST', body: { kind, message } })
export const getMyEvolution = (modelId) => request(`/me/evolution/${modelId}`)
