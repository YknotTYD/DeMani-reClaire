import { request } from './client'

export const EVOLUTION_STATUSES = [
  { value: 'a_discuter', label: 'À discuter' },
  { value: 'propose', label: 'Proposé' },
  { value: 'fait', label: 'Fait' },
]

export const listEvolutions = () => request('/evolutions')
export const updateEvolution = (id, status, note) =>
  request(`/evolutions/${id}`, { method: 'PATCH', body: { status, note } })
