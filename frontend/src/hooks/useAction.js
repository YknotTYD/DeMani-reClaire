import { useState } from 'react'

/**
 * Exécute une action (création, suppression...) et garde son message d'erreur.
 * Retourne `true` si l'action a réussi.
 */
export function useAction() {
  const [error, setError] = useState(null)
  const [pending, setPending] = useState(false)

  const run = async (action) => {
    setError(null)
    setPending(true)
    try {
      await action()
      return true
    } catch (e) {
      setError(e.message)
      return false
    } finally {
      setPending(false)
    }
  }

  return { run, error, setError, pending }
}
