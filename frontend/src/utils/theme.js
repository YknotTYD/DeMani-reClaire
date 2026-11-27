const STORAGE_KEY = 'trajectoires-theme'

/** Thème choisi par l'utilisateur, sinon celui de son système. */
export function initialTheme() {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved === 'light' || saved === 'dark') return saved
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function applyTheme(theme) {
  document.documentElement.dataset.theme = theme
}

export function saveTheme(theme) {
  localStorage.setItem(STORAGE_KEY, theme)
}
