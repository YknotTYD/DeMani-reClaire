import { Link } from 'react-router-dom'

/** Modèles de questionnaire : nom, taille du tableau, nombre d'envois. */
export default function ModelList({ models }) {
  if (models.length === 0) return <p className="muted">Aucun modèle. Crée par exemple « Ambiance » ou « Intégration ».</p>

  return (
    <ul className="soft-list">
      {models.map((m) => {
        const rows = m.criteria.filter((c) => c.axis === 'row').length
        const columns = m.criteria.length - rows
        return (
          <li key={m.id}>
            <div className="soft-list__main">
              <Link to={`/questionnaires/modeles/${m.id}`}>{m.name}</Link>
              <span className="muted">
                {rows} ligne{rows > 1 ? 's' : ''} × {columns} colonne{columns > 1 ? 's' : ''} · envoyé {m.questionnaire_count} fois
              </span>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
