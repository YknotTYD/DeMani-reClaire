import { request } from './client'

export const listTeams = () => request('/teams')
export const getTeam = (id) => request(`/teams/${id}`)
export const createTeam = (name) => request('/teams', { method: 'POST', body: { name } })
export const renameTeam = (id, name) => request(`/teams/${id}`, { method: 'PATCH', body: { name } })
export const deleteTeam = (id) => request(`/teams/${id}`, { method: 'DELETE' })
export const addTeamMember = (teamId, userId) =>
  request(`/teams/${teamId}/members`, { method: 'POST', body: { user_id: userId } })
export const removeTeamMember = (teamId, userId) =>
  request(`/teams/${teamId}/members/${userId}`, { method: 'DELETE' })
