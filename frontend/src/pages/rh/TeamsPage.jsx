import { listMembers } from '../../api/members'
import { addTeamMember, createTeam, listTeams } from '../../api/teams'
import AsyncContent from '../../components/common/AsyncContent'
import ErrorMessage from '../../components/common/ErrorMessage'
import SearchableList from '../../components/common/SearchableList'
import TeamCreateForm from '../../components/teams/TeamCreateForm'
import TeamList from '../../components/teams/TeamList'
import { useAction } from '../../hooks/useAction'
import { useAsync } from '../../hooks/useAsync'

export default function TeamsPage() {
  const teams = useAsync(listTeams)
  const members = useAsync(listMembers)
  const { run, error } = useAction()

  const handleCreate = async (name, memberIds) => {
    const ok = await run(async () => {
      const team = await createTeam(name)
      for (const id of memberIds) await addTeamMember(team.id, id)
    })
    teams.reload()
    return ok
  }

  return (
    <>
      <h1>Équipes</h1>
      <AsyncContent {...teams}>
        {(data) =>
          data.length === 0 ? (
            <p className="muted">Aucune équipe pour le moment.</p>
          ) : (
            <SearchableList
              items={data}
              getText={(t) => `${t.name} ${t.members.map((m) => m.name).join(' ')}`}
              getName={(t) => t.name}
              alphabetical
              placeholder="Rechercher une équipe ou un membre…"
            >
              {(visible) => <TeamList teams={visible} />}
            </SearchableList>
          )
        }
      </AsyncContent>

      <section className="panel">
        <h2>Nouvelle équipe</h2>
        <AsyncContent {...members}>{(list) => <TeamCreateForm members={list} onCreate={handleCreate} />}</AsyncContent>
        <ErrorMessage message={error} />
      </section>
    </>
  )
}
