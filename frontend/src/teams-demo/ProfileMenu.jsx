import { PERSONAS, PRESENCES } from './data'
import TmAvatar from './TmAvatar'

/** Menu du profil : statut, thème, et changement de compte pour la démo. */
export default function ProfileMenu({ me, presence, onPresence, theme, onTheme, persona, onPersona, onClose }) {
  return (
    <>
      <div className="tm-backdrop" onClick={onClose} />
      <div className="tm-menu" role="menu">
        <div className="tm-menu__head">
          <TmAvatar person={{ ...me, color: '#d9e6c9' }} presence={presence} size={48} />
          <div>
            <strong>{me.name}</strong>
            <span>{me.title}</span>
            <span>{me.email}</span>
          </div>
        </div>
        <p className="tm-menu__label">Statut</p>
        {Object.entries(PRESENCES).filter(([k]) => k !== 'offline').map(([key, label]) => (
          <button key={key} type="button" className="tm-menu__item" onClick={() => onPresence(key)}>
            <span className={`tm-presence tm-presence--${key} tm-presence--inline`} /> {label}
            {presence === key && <span className="tm-menu__check">✓</span>}
          </button>
        ))}
        <p className="tm-menu__label">Thème</p>
        <button type="button" className="tm-menu__item" onClick={() => onTheme(theme === 'dark' ? 'light' : 'dark')}>
          {theme === 'dark' ? 'Passer en thème clair' : 'Passer en thème sombre'}
        </button>
        <p className="tm-menu__label">Changer de compte (démo)</p>
        {Object.entries(PERSONAS).map(([key, p]) => (
          <button key={key} type="button" className="tm-menu__item" onClick={() => onPersona(key)}>
            {p.name} <span className="tm-muted">· {key === 'rh' ? 'RH' : 'collaborateur'}</span>
            {persona === key && <span className="tm-menu__check">✓</span>}
          </button>
        ))}
      </div>
    </>
  )
}
