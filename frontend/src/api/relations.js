import { request } from './client'

export const listTeamRelations = (teamId) => request(`/relations?team_id=${teamId}`)
export const listMemberRelations = (memberId) => request(`/relations?member_id=${memberId}`)
/** Pour « tuteur » et « parrain », le premier membre accompagne le second. */
export const saveRelation = (memberAId, memberBId, kind) =>
  request('/relations', {
    method: 'PUT',
    body: { member_a_id: memberAId, member_b_id: memberBId, kind },
  })
export const deleteRelation = (id) => request(`/relations/${id}`, { method: 'DELETE' })
