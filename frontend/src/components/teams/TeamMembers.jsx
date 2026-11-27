import { Link } from 'react-router-dom'
import Avatar from '../common/Avatar'

export default function TeamMembers({ members, onRemove }) {
  if (members.length === 0) return <p className="muted">Aucun membre dans cette équipe.</p>

  return (
    <ul className="soft-list">
      {members.map((member) => (
        <li key={member.id}>
          <Avatar name={member.name} />
          <div className="soft-list__main">
            <Link to={`/membres/${member.id}`}>{member.name}</Link>
          </div>
          <button type="button" className="button--link" onClick={() => onRemove(member.id)}>
            Retirer
          </button>
        </li>
      ))}
    </ul>
  )
}
