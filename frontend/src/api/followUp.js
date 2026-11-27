import { request } from './client'

/** Rappels « n'oublier personne » + part des collaborateurs vus dans les 12 mois */
export const getReminders = () => request('/reminders')
export const listContactRequests = () => request('/contact-requests')
export const updateContactRequest = (id, status) =>
  request(`/contact-requests/${id}`, { method: 'PATCH', body: { status } })
