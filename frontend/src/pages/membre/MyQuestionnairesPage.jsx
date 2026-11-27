import { Link } from 'react-router-dom'
import { listMyQuestionnaires } from '../../api/questionnaires'
import AsyncContent from '../../components/common/AsyncContent'
import QuarterGroups from '../../components/questionnaires/QuarterGroups'
import { useAsync } from '../../hooks/useAsync'

/** Questionnaires envoyés aux équipes du membre, rangés par trimestre. */
export default function MyQuestionnairesPage() {
  const questionnaires = useAsync(listMyQuestionnaires)

  return (
    <>
      <h1>Mes questionnaires</h1>
      <AsyncContent {...questionnaires}>
        {(list) => (
          <QuarterGroups
            items={list}
            renderItems={(items) => (
              <ul className="card-list">
                {items.map((q) => (
                  <li key={q.id} className="card">
                    <span className="card__title">{q.model_name}</span>
                    <span className="status-group status-group--left">
                      <span className={q.answered ? 'status status--retenu' : 'status status--nouveau'}>
                        {q.answered ? 'Répondu' : 'À remplir'}
                      </span>
                      {q.answered && (
                        <span className={q.shared ? 'status status--shared' : 'status status--private'}>
                          {q.shared ? 'Partagé avec le RH' : 'Privé'}
                        </span>
                      )}
                    </span>
                    <Link to={`/mes-questionnaires/${q.id}`}>{q.answered ? 'Modifier mes réponses' : 'Remplir'}</Link>
                  </li>
                ))}
              </ul>
            )}
          />
        )}
      </AsyncContent>
    </>
  )
}
