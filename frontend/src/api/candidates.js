import { request } from './client'

export const listCandidates = () => request('/candidates')
export const getCandidate = (id) => request(`/candidates/${id}`)
export const updateCandidate = (id, { name, email, status }) =>
  request(`/candidates/${id}`, { method: 'PATCH', body: { name, email: email || null, status } })
export const deleteCandidate = (id) => request(`/candidates/${id}`, { method: 'DELETE' })
export const searchCandidates = (q) => request(`/candidates/search?q=${encodeURIComponent(q)}`)
export const purgeExpiredCandidates = () => request('/candidates/purge-expired', { method: 'POST' })
