import { useCallback, useEffect, useState } from 'react'

/**
 * Charge une donnée via une fonction asynchrone.
 * `reload()` relance le chargement (après une création / suppression par exemple).
 */
export function useAsync(asyncFn, deps = []) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(asyncFn, deps)

  const reload = useCallback(() => {
    setLoading(true)
    setError(null)
    return load()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [load])

  useEffect(() => {
    reload()
  }, [reload])

  return { data, error, loading, reload }
}
