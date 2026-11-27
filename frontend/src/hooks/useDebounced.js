import { useEffect, useState } from 'react'

/** Renvoie `value` seulement quand elle n'a pas changé depuis `delay` ms (évite un appel par touche). */
export function useDebounced(value, delay = 250) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}
