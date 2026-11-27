import { useState } from 'react'
import { applyTheme, initialTheme, saveTheme } from '../utils/theme'

export function useTheme() {
  const [theme, setTheme] = useState(initialTheme)

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    applyTheme(next)
    saveTheme(next)
    setTheme(next)
  }

  return { theme, toggle }
}
