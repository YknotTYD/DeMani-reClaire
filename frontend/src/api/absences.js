import { downloadFile, request } from './client'

// Collaborateur
export const listMyAbsences = () => request('/me/absences')
export const cancelAbsence = (id) => request(`/me/absences/${id}`, { method: 'DELETE' })
export function declareAbsence({ files, ...fields }) {
  const body = new FormData()
  Object.entries(fields).forEach(([key, value]) => body.append(key, value))
  files.forEach((file) => body.append('files', file))
  return request('/me/absences', { method: 'POST', body })
}

// RH
export function listAbsences({ start, end, status } = {}) {
  const params = new URLSearchParams()
  if (start) params.set('start', start)
  if (end) params.set('end', end)
  if (status) params.set('status', status)
  return request(`/absences?${params}`)
}
export const decideAbsence = (id, status, rhComment = '') =>
  request(`/absences/${id}`, { method: 'PATCH', body: { status, rh_comment: rhComment } })

// Les deux
export const downloadProof = (document) => downloadFile(`/absence-documents/${document.id}/download`, document.filename)
