import { useState } from 'react'
import Icon from './icons'
import ProfileMenu from './ProfileMenu'
import TmAvatar from './TmAvatar'

/** Barre du haut : navigation, recherche, profil avec présence. */
export default function TitleBar({ me, presence, onPresence, theme, onTheme, persona, onPersona }) {
  const [menuOpen, setMenuOpen] = useState(false)
  return (
    <header className="tm-titlebar">
      <div className="tm-titlebar__nav">
        <button type="button" className="tm-icon-button" aria-label="Précédent"><Icon name="back" size={16} /></button>
        <button type="button" className="tm-icon-button" aria-label="Suivant"><Icon name="forward" size={16} /></button>
      </div>
      <label className="tm-search">
        <Icon name="search" size={16} />
        <input placeholder="Rechercher" />
      </label>
      <div className="tm-titlebar__right">
        <button type="button" className="tm-icon-button" aria-label="Paramètres et autres"><Icon name="more" size={18} /></button>
        <span className="tm-org">BPALC</span>
        <button type="button" className="tm-me" onClick={() => setMenuOpen((o) => !o)} aria-label="Mon profil">
          <TmAvatar person={{ ...me, color: '#d9e6c9' }} presence={presence} size={30} />
        </button>
        {menuOpen && (
          <ProfileMenu
            me={me}
            presence={presence}
            onPresence={onPresence}
            theme={theme}
            onTheme={onTheme}
            persona={persona}
            onPersona={(p) => {
              onPersona(p)
              setMenuOpen(false)
            }}
            onClose={() => setMenuOpen(false)}
          />
        )}
      </div>
    </header>
  )
}
