import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getMyAnswers, getQuestionnaireForm, shareMyAnswers, submitMyAnswers } from '../../api/questionnaires'
import AsyncContent from '../../components/common/AsyncContent'
import ErrorMessage from '../../components/common/ErrorMessage'
import AnswerGrid from '../../components/questionnaires/AnswerGrid'
import EvolutionQuestion from '../../components/questionnaires/EvolutionQuestion'
import SharePanel from '../../components/questionnaires/SharePanel'
import { useAction } from '../../hooks/useAction'
import { useAsync } from '../../hooks/useAsync'
import { answersToMap, cellKey, isComplete, mapToAnswers, splitCriteria } from '../../utils/criteria'

export default function FillQuestionnairePage() {
  const questionnaireId = Number(useParams().questionnaireId)
  const form = useAsync(() => getQuestionnaireForm(questionnaireId), [questionnaireId])
  const saved = useAsync(() => getMyAnswers(questionnaireId), [questionnaireId])
  const { run, error, pending } = useAction()
  const [values, setValues] = useState({})
  const [wantsEvolution, setWantsEvolution] = useState(null)
  const [success, setSuccess] = useState(false)

  // Pré-remplit avec les réponses déjà envoyées
  useEffect(() => {
    if (!saved.data) return
    setValues(answersToMap(saved.data.answers))
    setWantsEvolution(saved.data.wants_evolution)
  }, [saved.data])

  const handleChange = (key, value) => {
    setSuccess(false)
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  const handleEvolutionChange = (value) => {
    setSuccess(false)
    setWantsEvolution(value)
  }

  return (
    <>
      {form.data && (
        <h1>
          {form.data.model_name} <span className="muted">· {form.data.label}</span>
        </h1>
      )}
      <p className="muted">Réponds case par case (les colonnes facultatives peuvent rester vides), puis à la question en dessous.</p>
      <AsyncContent {...form}>
        {(f) => {
          const { rows, columns } = splitCriteria(f.criteria)
          // On ne garde que les cases du tableau actuel (un critère a pu être supprimé entre-temps)
          const cells = rows.flatMap((r) => columns.map((c) => cellKey(r.id, c.id)))
          const complete = isComplete(rows, columns, values) && wantsEvolution !== null

          const handleSubmit = async () => {
            const current = Object.fromEntries(cells.map((key) => [key, values[key]]))
            const ok = await run(() => submitMyAnswers(questionnaireId, mapToAnswers(current), wantsEvolution))
            setSuccess(ok)
            if (ok) saved.reload()
          }

          return (
            <section className="panel">
              <AnswerGrid rows={rows} columns={columns} values={values} onChange={handleChange} />
              <EvolutionQuestion value={wantsEvolution} onChange={handleEvolutionChange} />
              <ErrorMessage message={error} />
              {success && <p className="success">Réponses enregistrées.</p>}
              {saved.data?.wants_evolution !== null && saved.data?.wants_evolution !== undefined && (
                <SharePanel
                  shared={saved.data.shared}
                  onChange={async (shared) => (await run(() => shareMyAnswers(questionnaireId, shared))) && saved.reload()}
                />
              )}
              <button type="button" onClick={handleSubmit} disabled={!complete || pending}>
                Envoyer
              </button>
            </section>
          )
        }}
      </AsyncContent>
    </>
  )
}
