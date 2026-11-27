import { useState } from 'react'
import { getMemberAnswers, getModelEvolution } from '../../api/questionnaires'
import { useAsync } from '../../hooks/useAsync'
import { answersToMap, splitCriteria } from '../../utils/criteria'
import EvolutionChart from '../charts/EvolutionChart'
import AsyncContent from '../common/AsyncContent'
import ChipGroup from '../common/ChipGroup'
import AnswerGrid from '../questionnaires/AnswerGrid'
import EvolutionQuestion from '../questionnaires/EvolutionQuestion'

/** Réponses d'un membre pour un modèle : sa courbe d'évolution, puis le détail d'un trimestre. */
function ModelAnswers({ memberId, modelId, answered }) {
  const evolution = useAsync(() => getModelEvolution(modelId, memberId), [modelId, memberId])
  const [questionnaireId, setQuestionnaireId] = useState(answered[0].questionnaire_id)
  const answers = useAsync(() => getMemberAnswers(questionnaireId, memberId), [questionnaireId, memberId])

  return (
    <>
      <AsyncContent {...evolution}>
        {(data) => (
          <>
            <EvolutionChart evolution={data} title="Évolution du membre (trimestres partagés)" />
            <h3>Détail d'un trimestre</h3>
            <ChipGroup
              label="Trimestre"
              options={answered.map((a) => ({ value: a.questionnaire_id, label: a.label }))}
              value={questionnaireId}
              onChange={setQuestionnaireId}
            />
            <AsyncContent {...answers}>
              {(sub) => (
                <>
                  <AnswerGrid {...splitCriteria(data.criteria)} values={answersToMap(sub.answers)} />
                  <EvolutionQuestion value={sub.wants_evolution} />
                </>
              )}
            </AsyncContent>
          </>
        )}
      </AsyncContent>
    </>
  )
}

/**
 * `answered` : questionnaires auxquels le membre a répondu (du plus récent au plus ancien).
 * Le RH ne voit que ceux que le collaborateur a choisi de partager (rapport, section 6.1, levier 2).
 */
export default function MemberQuestionnaires({ memberId, answered }) {
  const shared = answered.filter((a) => a.shared)
  const models = [...new Map(shared.map((a) => [a.model_id, a.model_name])).entries()]
  const [modelId, setModelId] = useState(models[0]?.[0] ?? null)
  const privateCount = answered.length - shared.length

  const privacy = (
    <p className="notice notice--privacy">
      {answered.length} questionnaire{answered.length > 1 ? 's' : ''} rempli{answered.length > 1 ? 's' : ''},{' '}
      {shared.length} partagé{shared.length > 1 ? 's' : ''} par le collaborateur.
      {privateCount > 0 && ' Les réponses non partagées restent visibles par lui seul.'}
    </p>
  )

  if (answered.length === 0) return <p className="muted">Ce membre n'a encore répondu à aucun questionnaire.</p>
  if (models.length === 0) return privacy

  return (
    <>
      {privacy}
      {models.length > 1 && (
        <ChipGroup label="Questionnaire" options={models.map(([value, label]) => ({ value, label }))} value={modelId} onChange={setModelId} />
      )}
      <ModelAnswers
        key={modelId}
        memberId={memberId}
        modelId={modelId}
        answered={shared.filter((a) => a.model_id === modelId)}
      />
    </>
  )
}
