import Logo from '../components/branding/Logo'
import Icon from './icons'

const ITEMS = [
  { id: 'activite', label: 'Activité' },
  { id: 'conversation', label: 'Conversation' },
  { id: 'equipes', label: 'Équipes' },
  { id: 'calendrier', label: 'Calendrier' },
  { id: 'appels', label: 'Appels' },
  { id: 'fichiers', label: 'Fichiers' },
]

/** Barre d'applications à gauche, avec Trajectoires épinglée. */
export default function AppRail({ view, onView, badges }) {
  const item = (id, label, icon) => (
    <button key={id} type="button" className={`tm-rail__item ${view === id ? 'is-active' : ''}`} onClick={() => onView(id)}>
      <span className="tm-rail__icon">
        {icon}
        {badges[id] > 0 && <span className="tm-badge">{badges[id]}</span>}
      </span>
      <span className="tm-rail__label">{label}</span>
    </button>
  )
  return (
    <nav className="tm-rail" aria-label="Applications">
      {ITEMS.map((i) => item(i.id, i.label, <Icon name={i.id} />))}
      <span className="tm-rail__sep" />
      {item('trajectoires', 'Trajectoires', <Logo size={24} />)}
      {item('plus', 'Plus', <Icon name="plus" />)}
      <span className="tm-rail__spacer" />
      {item('applications', 'Applications', <Icon name="applications" />)}
    </nav>
  )
}
