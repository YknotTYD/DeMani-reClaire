import { NavLink } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import Logo from '../branding/Logo'
import Wordmark from '../branding/Wordmark'
import Avatar from '../common/Avatar'
import ThemeToggle from '../common/ThemeToggle'
import AlertsLink from './AlertsLink'
import HostBadge from './HostBadge'

const RH_SECTIONS = [
  {
    title: 'Suivi des équipes',
    links: [
      { to: '/equipes', label: 'Équipes' },
      { to: '/membres', label: 'Membres' },
      { to: '/questionnaires', label: 'Questionnaires' },
    ],
    withAlerts: true,
  },
  {
    title: 'Recrutement',
    links: [
      { to: '/depot-cv', label: 'Dépôt et recherche de CV' },
      { to: '/candidats', label: 'Candidats' },
    ],
  },
  {
    title: 'Agenda',
    links: [
      { to: '/calendrier', label: 'Calendrier' },
      { to: '/absences', label: 'Absences' },
    ],
  },
  { title: "Système d'information", links: [{ to: '/connexions', label: 'Connexions' }] },
]

const MEMBRE_SECTIONS = [
  {
    title: 'Mon espace',
    links: [
      { to: '/mon-profil', label: 'Mon profil' },
      { to: '/mes-questionnaires', label: 'Mes questionnaires' },
      { to: '/mes-rendez-vous', label: 'Mes rendez-vous' },
      { to: '/mes-absences', label: 'Mes absences' },
      { to: '/mes-documents', label: 'Mes documents' },
    ],
  },
]

/** Barre latérale : logo, liens regroupés par thème, thème clair/sombre, utilisateur connecté. */
export default function Navbar() {
  const { user, logout } = useAuth()
  const sections = user.role === 'rh' ? RH_SECTIONS : MEMBRE_SECTIONS

  return (
    <nav className="sidebar">
      <div className="sidebar__brand">
        <Logo size={40} />
        <Wordmark size={24} />
      </div>

      {sections.map((section) => (
        <div key={section.title} className="sidebar__section">
          <p className="sidebar__title">{section.title}</p>
          {section.links.map((link) => (
            <NavLink key={link.to} to={link.to} className="sidebar__link">
              {link.label}
            </NavLink>
          ))}
          {section.withAlerts && <AlertsLink />}
        </div>
      ))}

      <div className="sidebar__footer">
        <HostBadge />
        <ThemeToggle />
        <div className="sidebar__user">
          <Avatar name={user.name} />
          <span className="sidebar__username">{user.name}</span>
        </div>
        <button type="button" className="button--ghost" onClick={logout}>
          Déconnexion
        </button>
      </div>
    </nav>
  )
}
