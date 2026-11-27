import { useEffect, useRef, useState } from 'react'
import Logo from '../components/branding/Logo'
import { signInAs } from './demoAuth'

/** Trajectoires affiché dans un onglet, après une « connexion automatique » avec le compte de la personne. */
export default function TrajectoiresFrame({ persona, theme, path }) {
  const [ready, setReady] = useState(false)
  const [error, setError] = useState(null)
  const frame = useRef(null)

  useEffect(() => {
    let cancelled = false
    setReady(false)
    // Petit délai : le temps de lire « Connexion avec votre compte professionnel » à l'écran
    Promise.all([signInAs(persona), new Promise((r) => setTimeout(r, 700))])
      .then(() => !cancelled && setReady(true))
      .catch((e) => !cancelled && setError(e.message))
    return () => {
      cancelled = true
    }
  }, [persona])

  const applyTheme = () => {
    const doc = frame.current?.contentDocument
    if (doc) doc.documentElement.dataset.theme = theme
  }
  useEffect(() => {
    applyTheme()
  }, [theme]) // eslint-disable-line react-hooks/exhaustive-deps

  if (error) return <p className="tm-frame-state">Trajectoires ne répond pas ({error}). Le serveur est-il lancé ?</p>
  if (!ready) {
    return (
      <div className="tm-frame-state">
        <Logo size={56} />
        <p>Connexion avec votre compte professionnel…</p>
        <span className="tm-spinner" />
      </div>
    )
  }
  return <iframe ref={frame} key={`${persona}${path}`} className="tm-frame" src={path} title="Trajectoires" onLoad={applyTheme} />
}
