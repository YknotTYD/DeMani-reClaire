import { downloadFile, request } from './client'

/** Lit le fichier et propose { name, email } — rien n'est enregistré. */
export function extractContact(file) {
  const form = new FormData()
  form.append('file', file)
  return request('/documents/extract', { method: 'POST', body: form })
}

/** Range le fichier dans Poste / Candidat / Fichier. Retourne { candidate_id, candidate_name, path, new_candidate }. */
export function fileDocument(file, { positionId, name, email, docType, status, informed }) {
  const form = new FormData()
  form.append('file', file)
  form.append('position_id', positionId)
  form.append('candidate_name', name)
  form.append('candidate_email', email)
  form.append('doc_type', docType)
  form.append('candidate_status', status)
  form.append('candidate_informed', informed ? 'true' : 'false')
  return request('/documents', { method: 'POST', body: form })
}

export const downloadDocument = (doc) => downloadFile(`/documents/${doc.id}/download`, doc.filename)
export const deleteDocument = (id) => request(`/documents/${id}`, { method: 'DELETE' })
