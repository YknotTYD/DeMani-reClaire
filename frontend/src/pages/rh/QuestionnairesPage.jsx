import { createModel, createQuestionnaire, listModels, listQuestionnaires } from '../../api/questionnaires'
import { listTeams } from '../../api/teams'
import AsyncContent from '../../components/common/AsyncContent'
import ErrorMessage from '../../components/common/ErrorMessage'
import InlineForm from '../../components/common/InlineForm'
import SearchableList from '../../components/common/SearchableList'
import LaunchQuestionnaireForm from '../../components/questionnaires/LaunchQuestionnaireForm'
import ModelList from '../../components/questionnaires/ModelList'
import QuarterGroups from '../../components/questionnaires/QuarterGroups'
import QuestionnaireCards from '../../components/questionnaires/QuestionnaireCards'
import { useAction } from '../../hooks/useAction'
import { useAsync } from '../../hooks/useAsync'

export default function QuestionnairesPage() {
  const questionnaires = useAsync(listQuestionnaires)
  const models = useAsync(listModels)
  const teams = useAsync(listTeams)
  const { run, error } = useAction()

  const act = async (action) => {
    const ok = await run(action)
    if (ok) {
      questionnaires.reload()
      models.reload()
    }
    return ok
  }

  return (
    <>
      <h1>Questionnaires</h1>
      <ErrorMessage message={error} />

      <section className="panel">
        <h2>Par trimestre</h2>
        <AsyncContent {...questionnaires}>
          {(list) => (
            <QuarterGroups
              items={list}
              renderItems={(items) => (
                <SearchableList items={items} getText={(q) => `${q.model_name} ${q.teams.map((t) => t.name).join(' ')}`}>
                  {(visible) => <QuestionnaireCards questionnaires={visible} />}
                </SearchableList>
              )}
            />
          )}
        </AsyncContent>
      </section>

      <div className="columns">
        <section className="panel">
          <h2>Envoyer un questionnaire</h2>
          <AsyncContent {...models}>
            {(modelList) => (
              <AsyncContent {...teams}>
                {(teamList) => (
                  <LaunchQuestionnaireForm
                    models={modelList}
                    teams={teamList}
                    onSubmit={(data) => act(() => createQuestionnaire(data))}
                  />
                )}
              </AsyncContent>
            )}
          </AsyncContent>
        </section>

        <section className="panel">
          <h2>Modèles</h2>
          <p className="muted">Chaque modèle a son propre tableau. Le renvoyer chaque trimestre permet de suivre l'évolution.</p>
          <AsyncContent {...models}>
            {(list) => (
              <SearchableList items={list} getText={(m) => m.name} getName={(m) => m.name} alphabetical>
                {(visible) => <ModelList models={visible} />}
              </SearchableList>
            )}
          </AsyncContent>
          <InlineForm placeholder="Nouveau modèle, ex. Intégration" buttonLabel="Créer" onSubmit={(name) => act(() => createModel(name))} />
        </section>
      </div>
    </>
  )
}
