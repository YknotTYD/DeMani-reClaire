import { useState } from 'react'
import { getMyEvolution } from '../../api/me'
import { useAsync } from '../../hooks/useAsync'
import EvolutionChart from '../charts/EvolutionChart'
import AsyncContent from '../common/AsyncContent'
import ChipGroup from '../common/ChipGroup'

function ModelResults({ modelId }) {
  const evolution = useAsync(() => getMyEvolution(modelId), [modelId])
  return <AsyncContent {...evolution}>{(data) => <EvolutionChart evolution={data} title="Mes réponses" />}</AsyncContent>
}

/** Mes propres résultats, trimestre par trimestre : je les vois en premier, partagés ou non. */
export default function MyResults({ questionnaires }) {
  const models = [...new Map(questionnaires.filter((q) => q.answered).map((q) => [q.model_id, q.model_name])).entries()]
  const [modelId, setModelId] = useState(models[0]?.[0] ?? null)
  if (models.length === 0) return <p className="muted">Tu n'as encore répondu à aucun questionnaire.</p>

  return (
    <>
      {models.length > 1 && (
        <ChipGroup label="Questionnaire" options={models.map(([value, label]) => ({ value, label }))} value={modelId} onChange={setModelId} />
      )}
      <ModelResults key={modelId} modelId={modelId} />
    </>
  )
}
