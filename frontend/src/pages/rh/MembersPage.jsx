import { createMember, deleteMember, listMembers } from '../../api/members'
import AsyncContent from '../../components/common/AsyncContent'
import ErrorMessage from '../../components/common/ErrorMessage'
import MemberForm from '../../components/members/MemberForm'
import MemberList from '../../components/members/MemberList'
import SearchableList from '../../components/common/SearchableList'
import { useAction } from '../../hooks/useAction'
import { useAsync } from '../../hooks/useAsync'

export default function MembersPage() {
  const members = useAsync(listMembers)
  const { run, error } = useAction()

  const act = async (action) => {
    const ok = await run(action)
    if (ok) members.reload()
    return ok
  }

  return (
    <>
      <h1>Membres</h1>
      <section className="panel">
        <h2>Nouveau membre</h2>
        <MemberForm onSubmit={(form) => act(() => createMember(form))} />
        <ErrorMessage message={error} />
      </section>
      <AsyncContent {...members}>
        {(data) => (
          <SearchableList
            items={data}
            getText={(m) => `${m.name} ${m.email}`}
            getName={(m) => m.name}
            alphabetical
            placeholder="Rechercher un membre (nom ou email)…"
          >
            {(visible) => <MemberList members={visible} onDelete={(id) => act(() => deleteMember(id))} />}
          </SearchableList>
        )}
      </AsyncContent>
    </>
  )
}
