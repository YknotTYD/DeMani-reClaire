import { NavLink } from 'react-router-dom'
import { useAlertSummary } from '../../hooks/useAlertSummary'

/** Lien « Alertes » avec le nombre d'alertes à traiter. */
export default function AlertsLink() {
  const summary = useAlertSummary()
  const count = summary ? summary.reminders + summary.requests + summary.evolution_to_discuss : 0

  return (
    <NavLink to="/alertes" className="sidebar__link">
      Alertes
      {count > 0 && <span className="badge">{count}</span>}
    </NavLink>
  )
}
