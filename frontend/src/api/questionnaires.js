import { request } from './client'

// ---------- Modèles (ex. « Ambiance ») et leur tableau ----------

export const listModels = () => request('/questionnaire-models')
export const getModel = (id) => request(`/questionnaire-models/${id}`)
export const createModel = (name) => request('/questionnaire-models', { method: 'POST', body: { name } })
export const renameModel = (id, name) => request(`/questionnaire-models/${id}`, { method: 'PATCH', body: { name } })
export const deleteModel = (id) => request(`/questionnaire-models/${id}`, { method: 'DELETE' })

/** `column` : { label, answer_type, options, min_value, max_value, required } */
export const createRow = (modelId, label) =>
  request(`/questionnaire-models/${modelId}/criteria`, { method: 'POST', body: { axis: 'row', label } })
export const createColumn = (modelId, column) =>
  request(`/questionnaire-models/${modelId}/criteria`, { method: 'POST', body: { axis: 'column', ...column } })
export const updateCriterion = (id, label, required) =>
  request(`/criteria/${id}`, { method: 'PATCH', body: { label, required } })
export const deleteCriterion = (id) => request(`/criteria/${id}`, { method: 'DELETE' })

/** Moyennes trimestre par trimestre ; avec memberId : celles d'un seul membre. */
export const getModelEvolution = (modelId, memberId) =>
  request(`/questionnaire-models/${modelId}/evolution${memberId ? `?member_id=${memberId}` : ''}`)

// ---------- Questionnaires envoyés (un modèle, un trimestre, des équipes) ----------

export const listQuestionnaires = () => request('/questionnaires')
export const createQuestionnaire = ({ modelId, year, quarter, teamIds }) =>
  request('/questionnaires', { method: 'POST', body: { model_id: modelId, year, quarter, team_ids: teamIds } })
export const deleteQuestionnaire = (id) => request(`/questionnaires/${id}`, { method: 'DELETE' })
export const getQuestionnaireStats = (id) => request(`/questionnaires/${id}/stats`)
export const getQuestionnaireForm = (id) => request(`/questionnaires/${id}/form`)

// Les réponses arrivent sous la forme { answers: [...], wants_evolution: true | false | null }

// Vue RH
export const listAnsweredBy = (memberId) => request(`/questionnaires/answered-by/${memberId}`)
export const getMemberAnswers = (questionnaireId, memberId) =>
  request(`/questionnaires/${questionnaireId}/answers/${memberId}`)

// Vue membre
export const listMyQuestionnaires = () => request('/questionnaires/mine')
export const getMyAnswers = (questionnaireId) => request(`/questionnaires/${questionnaireId}/my-answers`)
export const submitMyAnswers = (questionnaireId, answers, wantsEvolution) =>
  request(`/questionnaires/${questionnaireId}/my-answers`, {
    method: 'PUT',
    body: { answers, wants_evolution: wantsEvolution },
  })
/** Le collaborateur choisit de partager (ou non) ses réponses avec le RH. */
export const shareMyAnswers = (questionnaireId, shared) =>
  request(`/questionnaires/${questionnaireId}/share`, { method: 'PUT', body: { shared } })
