import { Link } from 'react-router-dom'
import Avatar from '../common/Avatar'

export default function RespondentList({ respondents }) {
  return (
    <ul className="soft-list">
      {respondents.map((r) => (
        <li key={r.member_id}>
          <Avatar name={r.name} />
          <div className="soft-list__main">
            <Link to={`/membres/${r.member_id}`}>{r.name}</Link>
          </div>
          <span className={r.answered ? 'status status--retenu' : 'status status--nouveau'}>
            {r.answered ? 'A répondu' : 'En attente'}
          </span>
        </li>
      ))}
    </ul>
  )
}
