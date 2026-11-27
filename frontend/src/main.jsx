import '@fontsource/nunito/400.css'
import '@fontsource/nunito/600.css'
import '@fontsource/nunito/700.css'
import '@fontsource/nunito/800.css'
import '@fontsource/outfit/500.css'
import '@fontsource/outfit/700.css'
import '@fontsource/outfit/800.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { startOnDemoTeams } from './utils/demoHost'
import { applyTheme, initialTheme } from './utils/theme'

// Appliqué avant le premier affichage pour éviter un flash de la mauvaise couleur
applyTheme(initialTheme())
startOnDemoTeams()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
