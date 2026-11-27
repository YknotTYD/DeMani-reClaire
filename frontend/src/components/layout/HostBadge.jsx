import { inDemoTeams } from '../../utils/demoHost'
import SourceBadge from '../connectors/SourceBadge'

/** Dans la maquette de Teams, rappelle que l'application y est ouverte. Rien ailleurs. */
export default function HostBadge() {
  if (!inDemoTeams) return null
  return (
    <p className="host-badge">
      <SourceBadge source="teams" />
      Ouvert dans Teams
    </p>
  )
}
