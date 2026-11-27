import { Link } from 'react-router-dom'
import Avatar from '../common/Avatar'
import DeleteButton from '../common/DeleteButton'

export default function MemberList({ members, onDelete }) {
  if (members.length === 0) return <p className="muted">Aucun membre pour le moment.</p>

  return (
    <ul className="soft-list">
      {members.map((member) => (
        <li key={member.id}>
          <Avatar name={member.name} />
          <div className="soft-list__main">
            <Link to={`/membres/${member.id}`}>{member.name}</Link>
            <span className="muted">{member.email}</span>
          </div>
          <DeleteButton
            confirmMessage={`Supprimer ${member.name} ? Ses réponses et relations seront supprimées.`}
            onDelete={() => onDelete(member.id)}
          />
        </li>
      ))}
    </ul>
  )
}
