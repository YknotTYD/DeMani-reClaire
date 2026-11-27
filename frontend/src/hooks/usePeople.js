import { listCandidates } from '../api/candidates'
import { listMembers } from '../api/members'
import { useAsync } from './useAsync'

/** Membres et candidats, au format attendu par le formulaire de rendez-vous. */
export function usePeople() {
  return useAsync(async () => {
    const [members, candidates] = await Promise.all([listMembers(), listCandidates()])
    return {
      membre: members.map((m) => ({ id: m.id, name: m.name, detail: m.email })),
      candidat: candidates.map((c) => ({ id: c.id, name: c.name, detail: `Candidat · ${c.position_name}` })),
    }
  })
}
