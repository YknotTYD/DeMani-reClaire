import { Link } from 'react-router-dom'

export default function TeamList({ teams }) {
  if (teams.length === 0) return <p className="muted">Aucune équipe pour le moment.</p>

  return (
    <ul className="card-list">
      {teams.map((team) => (
        <li key={team.id} className="card">
          <Link to={`/equipes/${team.id}`} className="card__title">
            {team.name}
          </Link>
          <span className="muted">
            {team.members.length} membre{team.members.length > 1 ? 's' : ''}
          </span>
        </li>
      ))}
    </ul>
  )
}
