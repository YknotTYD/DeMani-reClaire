import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { listMembers } from '../../api/members'
import { deleteRelation, listTeamRelations, saveRelation } from '../../api/relations'
import { addTeamMember, deleteTeam, getTeam, removeTeamMember, renameTeam } from '../../api/teams'
import AsyncContent from '../../components/common/AsyncContent'
import DeleteButton from '../../components/common/DeleteButton'
import ErrorMessage from '../../components/common/ErrorMessage'
import InlineForm from '../../components/common/InlineForm'
import SearchableList from '../../components/common/SearchableList'
import RelationDiagram from '../../components/relations/RelationDiagram'
import RelationForm from '../../components/relations/RelationForm'
import RelationLegend from '../../components/relations/RelationLegend'
import RelationList from '../../components/relations/RelationList'
import MemberPicker from '../../components/teams/MemberPicker'
import TeamMembers from '../../components/teams/TeamMembers'
import { useAction } from '../../hooks/useAction'
import { useAsync } from '../../hooks/useAsync'

export default function TeamDetailPage() {
  const teamId = Number(useParams().teamId)
  const navigate = useNavigate()
  const team = useAsync(() => getTeam(teamId), [teamId])
  const relations = useAsync(() => listTeamRelations(teamId), [teamId])
  const allMembers = useAsync(listMembers)
  const { run, error } = useAction()
  const [selectedId, setSelectedId] = useState(null)

  // Lance une action puis recharge l'équipe et ses relations
  const act = async (action) => {
    const ok = await run(action)
    if (ok) {
      team.reload()
      relations.reload()
    }
    return ok
  }

  return (
    <AsyncContent {...team}>
      {(t) => {
        const membersById = Object.fromEntries(t.members.map((m) => [m.id, m]))
        const shownRelations = selectedId
          ? (relations.data ?? []).filter((r) => r.member_a_id === selectedId || r.member_b_id === selectedId)
          : (relations.data ?? [])

        return (
          <>
            <div className="page-header">
              <h1>{t.name}</h1>
              <DeleteButton
                label="Supprimer l'équipe"
                confirmMessage={`Supprimer l'équipe ${t.name} ? Les membres ne sont pas supprimés.`}
                onDelete={async () => (await run(() => deleteTeam(teamId))) && navigate('/equipes')}
              />
            </div>
            <ErrorMessage message={error} />

            <div className="columns">
              <section className="panel">
                <h2>Membres</h2>
                <SearchableList items={t.members} getText={(m) => m.name} getName={(m) => m.name} alphabetical>
                  {(visible) => (
                    <TeamMembers members={visible} onRemove={(id) => act(() => removeTeamMember(teamId, id))} />
                  )}
                </SearchableList>
                <h3>Ajouter des membres</h3>
                <AsyncContent {...allMembers}>
                  {(all) => (
                    <MemberPicker
                      members={all}
                      excludedIds={t.members.map((m) => m.id)}
                      onAdd={(m) => act(() => addTeamMember(teamId, m.id))}
                    />
                  )}
                </AsyncContent>
                <h3>Renommer</h3>
                <InlineForm
                  initialValue={t.name}
                  buttonLabel="Renommer"
                  onSubmit={(name) => act(() => renameTeam(teamId, name))}
                />
              </section>

              <section className="panel">
                <h2>Liens de travail</h2>
                <p className="muted">Tuteurs, parrains, binômes, remplaçants : des faits, sans note sur les relations. Clique sur un membre pour voir ses liens.</p>
                <RelationDiagram
                  members={t.members}
                  relations={relations.data ?? []}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                />
                <RelationLegend />
                <RelationForm members={t.members} onSave={(a, b, s) => act(() => saveRelation(a, b, s))} />
                <h3>{selectedId ? `Liens de ${membersById[selectedId]?.name}` : 'Tous les liens'}</h3>
                <SearchableList
                  items={shownRelations}
                  getText={(r) => `${membersById[r.member_a_id]?.name} ${membersById[r.member_b_id]?.name}`}
                >
                  {(visible) => (
                    <RelationList
                      relations={visible}
                      membersById={membersById}
                      onDelete={(id) => act(() => deleteRelation(id))}
                    />
                  )}
                </SearchableList>
              </section>
            </div>
          </>
        )
      }}
    </AsyncContent>
  )
}
