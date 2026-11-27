import { request } from './client'

export const listPositions = () => request('/positions')
export const createPosition = (name) => request('/positions', { method: 'POST', body: { name } })
export const renamePosition = (id, name) => request(`/positions/${id}`, { method: 'PATCH', body: { name } })
export const deletePosition = (id) => request(`/positions/${id}`, { method: 'DELETE' })
