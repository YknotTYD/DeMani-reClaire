import { useNavigate, useParams } from 'react-router-dom'
import {
  createColumn,
  createRow,
  deleteCriterion,
  deleteModel,
  getModel,
  getModelEvolution,
  renameModel,
  updateCriterion,
} from '../../api/questionnaires'
import EvolutionChart from '../../components/charts/EvolutionChart'
import AsyncContent from '../../components/common/AsyncContent'
import DeleteButton from '../../components/common/DeleteButton'
import ErrorMessage from '../../components/common/ErrorMessage'
import InlineForm from '../../components/common/InlineForm'
import CriteriaAxisEditor from '../../components/criteria/CriteriaAxisEditor'
import AnswerGrid from '../../components/questionnaires/AnswerGrid'
import { useAction } from '../../hooks/useAction'
import { useAsync } from '../../hooks/useAsync'
import { splitCriteria } from '../../utils/criteria'

/** Un modèle : son tableau (lignes × colonnes) et l'évolution des moyennes au fil des trimestres. */
export default function ModelPage() {
  const modelId = Number(useParams().modelId)
  const navigate = useNavigate()
  const model = useAsync(() => getModel(modelId), [modelId])
  const evolution = useAsync(() => getModelEvolution(modelId), [modelId])
  const { run, error } = useAction()

  const act = async (action) => {
    const ok = await run(action)
    if (ok) {
      model.reload()
      evolution.reload()
    }
    return ok
  }

  const handlers = {
    onRename: (id, label) => act(() => updateCriterion(id, label)),
    onDelete: (id) => act(() => deleteCriterion(id)),
    onToggleRequired: (c) => act(() => updateCriterion(c.id, c.label, !c.required)),
  }

  return (
    <AsyncContent {...model}>
      {(m) => {
        const { rows, columns } = splitCriteria(m.criteria)
        return (
          <>
            <div className="page-header">
              <h1>{m.name}</h1>
              <DeleteButton
                label="Supprimer le modèle"
                confirmMessage={`Supprimer « ${m.name} », ses ${m.questionnaire_count} envoi(s) et toutes les réponses ?`}
                onDelete={async () => (await run(() => deleteModel(modelId))) && navigate('/questionnaires')}
              />
            </div>
            <ErrorMessage message={error} />

            <section className="panel">
              <h2>Évolution des moyennes</h2>
              <AsyncContent {...evolution}>{(data) => <EvolutionChart evolution={data} title={`Évolution — ${m.name}`} />}</AsyncContent>
            </section>

            {m.questionnaire_count > 0 && (
              <p className="notice">
                Ce modèle a déjà été envoyé : supprimer une ligne ou une colonne efface aussi les réponses données dessus, tous trimestres confondus. Le type de réponse d'une colonne ne se change pas : crée une nouvelle colonne.
              </p>
            )}
            <div className="columns">
              <CriteriaAxisEditor
                title="Lignes"
                placeholder="ex. Mon poste, Mon équipe"
                items={rows}
                onAdd={(label) => act(() => createRow(modelId, label))}
                {...handlers}
              />
              <CriteriaAxisEditor
                title="Colonnes"
                items={columns}
                onAddColumn={(column) => act(() => createColumn(modelId, column))}
                {...handlers}
              />
            </div>

            <section className="panel">
              <h2>Aperçu du tableau</h2>
              <AnswerGrid rows={rows} columns={columns} values={{}} />
              <h3>Renommer le modèle</h3>
              <InlineForm initialValue={m.name} buttonLabel="Renommer" onSubmit={(name) => act(() => renameModel(modelId, name))} />
            </section>
          </>
        )
      }}
    </AsyncContent>
  )
}
