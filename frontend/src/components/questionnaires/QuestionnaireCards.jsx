import { Link } from 'react-router-dom'
import ParticipationBar from './ParticipationBar'

const format = (v) => v.toLocaleString('fr-FR', { maximumFractionDigits: 2 })

/** Questionnaires envoyés (vue RH) : modèle, équipes, participation, moyenne. */
export default function QuestionnaireCards({ questionnaires }) {
  return (
    <ul className="card-list">
      {questionnaires.map((q) => (
        <li key={q.id} className="card">
          <Link to={`/questionnaires/${q.id}`} className="card__title">
            {q.model_name}
          </Link>
          <span className="muted">{q.teams.map((t) => t.name).join(', ')}</span>
          <ParticipationBar answered={q.answered_count} total={q.targeted_count} />
          <span>
            Moyenne : <strong>{q.masked ? 'masquée (moins de 10 réponses)' : q.overall_average === null ? '—' : `${format(q.overall_average)} ★`}</strong>
          </span>
        </li>
      ))}
    </ul>
  )
}
