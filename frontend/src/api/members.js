import { request } from './client'

export const listMembers = () => request('/members')
export const getMember = (id) => request(`/members/${id}`)
export const createMember = (member) => request('/members', { method: 'POST', body: member })
export const deleteMember = (id) => request(`/members/${id}`, { method: 'DELETE' })
export const listMemberDocuments = (id) => request(`/members/${id}/documents`)
