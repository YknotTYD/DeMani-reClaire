const BASE_URL = '/api'
const TOKEN_KEY = 'suivi-rh-token'

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
}

function authHeaders() {
  const token = tokenStore.get()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function errorFrom(response) {
  const data = await response.json().catch(() => null)
  const detail = data?.detail
  if (typeof detail === 'string') return new Error(detail)
  // Erreurs de validation : on garde le premier message, sans le préfixe technique
  const first = Array.isArray(detail) ? detail[0]?.msg?.replace(/^Value error, /, '') : null
  return new Error(first || 'Une erreur est survenue')
}

/** Appel JSON, ou envoi de fichier si `body` est un FormData. */
export async function request(path, { method = 'GET', body } = {}) {
  const isForm = body instanceof FormData
  const response = await fetch(BASE_URL + path, {
    method,
    headers: isForm ? authHeaders() : { 'Content-Type': 'application/json', ...authHeaders() },
    body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
  })

  if (!response.ok) throw await errorFrom(response)
  if (response.status === 204) return null
  return response.json()
}

/** Télécharge un fichier protégé par le token et l'ouvre / l'enregistre dans le navigateur. */
export async function downloadFile(path, filename) {
  const response = await fetch(BASE_URL + path, { headers: authHeaders() })
  if (!response.ok) throw await errorFrom(response)
  const url = URL.createObjectURL(await response.blob())
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
