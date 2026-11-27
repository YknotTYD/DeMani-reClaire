import Logo from '../components/branding/Logo'
import Icon from './icons'

/** Notification qui glisse en bas à droite de l'écran. */
export default function Toast({ toast, onOpen, onClose }) {
  if (!toast) return null
  return (
    <div className="tm-toast" role="status">
      <div className="tm-toast__head">
        <Logo size={18} /> <strong>Trajectoires</strong>
        <button type="button" className="tm-icon-button" onClick={onClose} aria-label="Fermer"><Icon name="close" size={14} /></button>
      </div>
      <p>{toast.text}</p>
      <button type="button" className="tm-button" onClick={() => onOpen(toast.path)}>Ouvrir</button>
    </div>
  )
}
