import { Link, useNavigate, useParams } from 'react-router-dom'
import { deleteQuestionnaire, getQuestionnaireStats } from '../../api/questionnaires'
import AsyncContent from '../../components/common/AsyncContent'
import DeleteButton from '../../components/common/DeleteButton'
import ErrorMessage from '../../components/common/ErrorMessage'
import SearchableList from '../../components/common/SearchableList'
import ParticipationBar from '../../components/questionnaires/ParticipationBar'
import RespondentList from '../../components/questionnaires/RespondentList'
import MaskedNotice from '../../components/questionnaires/MaskedNotice'
import ResultsGrid from '../../components/questionnaires/ResultsGrid'
import { useAction } from '../../hooks/useAction'
import { useAsync } from '../../hooks/useAsync'
import { splitCriteria } from '../../utils/criteria'

const format = (v) => v.toLocaleString('fr-FR', { maximumFractionDigits: 2 })

/** Un questionnaire envoyé : l'état général de l'ambiance (moyennes) et la participation. */
export default function QuestionnaireDetailPage() {
  const questionnaireId = Number(useParams().questionnaireId)
  const navigate = useNavigate()
  const stats = useAsync(() => getQuestionnaireStats(questionnaireId), [questionnaireId])
  const { run, error } = useAction()

  return (
    <AsyncContent {...stats}>
      {(s) => {
        const q = s.questionnaire
        return (
          <>
            <div className="page-header">
              <h1>
                {q.model_name} <span className="muted">· {q.label}</span>
              </h1>
              <DeleteButton
                label="Supprimer"
                confirmMessage={`Supprimer ce questionnaire et ses ${q.answered_count} réponse(s) ?`}
                onDelete={async () => (await run(() => deleteQuestionnaire(questionnaireId))) && navigate('/questionnaires')}
              />
            </div>
            <p className="muted">
              Envoyé à : {q.teams.map((t) => t.name).join(', ')} · <Link to={`/questionnaires/modeles/${q.model_id}`}>voir l'évolution du modèle</Link>
            </p>
            <ErrorMessage message={error} />

            <div className="stat-row">
              <div className="stat-tile">
                <span className="stat-tile__value">{s.masked ? 'Masquée' : s.overall_average === null ? '—' : `${format(s.overall_average)} ★`}</span>
                <span className="muted">moyenne générale (colonnes en étoiles)</span>
              </div>
              <div className="stat-tile">
                <ParticipationBar answered={q.answered_count} total={s.respondents.length} />
                <span className="muted">participation</span>
              </div>
              <div className="stat-tile">
                <span className="stat-tile__value">{s.evolution_yes}</span>
                <span className="muted">souhait{s.evolution_yes > 1 ? 's' : ''} d'évolution</span>
              </div>
            </div>

            <section className="panel">
              <h2>Résultats par case</h2>
              <p className="muted">Les réponses en texte libre sont affichées sans le nom de leur auteur.</p>
              {s.masked ? (
                <MaskedNotice answered={q.answered_count} minGroup={s.min_group} />
              ) : s.cells.length === 0 ? (
                <p className="muted">Pas encore de réponse.</p>
              ) : (
                <ResultsGrid {...splitCriteria(s.criteria)} cells={s.cells} />
              )}
            </section>

            <section className="panel">
              <h2>Destinataires</h2>
              <p className="muted">Pour relancer : on sait qui a répondu, jamais ce qu'il a répondu (sauf partage volontaire).</p>
              <SearchableList items={s.respondents} getText={(r) => r.name} getName={(r) => r.name} alphabetical>
                {(visible) => <RespondentList respondents={visible} />}
              </SearchableList>
            </section>
          </>
        )
      }}
    </AsyncContent>
  )
}
