import { EVOLUTION_STATUSES } from '../../api/evolutions'
import { formatDate } from '../../utils/dates'
import SourceBadge from '../connectors/SourceBadge'

const statusLabel = (value) => EVOLUTION_STATUSES.find((s) => s.value === value)?.label ?? value

/** Ce que la banque sait de mon parcours : je le vois en entier (rapport, annexe C). */
export default function ProfileSummary({ profile }) {
  return (
    <dl className="profile-facts">
      <dt>Compte</dt>
      <dd>
        {profile.email} <SourceBadge source="teams" />
      </dd>
      <dt>Date d'embauche</dt>
      <dd>
        {profile.hired_on ? new Date(profile.hired_on).toLocaleDateString('fr-FR') : 'Non renseignée'} <SourceBadge source="sirh" />
      </dd>
      <dt>Équipes</dt>
      <dd>{profile.teams.length ? profile.teams.join(', ') : 'Aucune'}</dd>
      <dt>Liens de travail</dt>
      <dd>{profile.links.length ? profile.links.map((l) => l.label).join(' · ') : 'Aucun'}</dd>
      <dt>Souhaits d'évolution</dt>
      <dd>
        {profile.evolutions.length
          ? profile.evolutions.map((e) => `${e.period} : ${statusLabel(e.status)} (le ${formatDate(e.created_at)})`).join(' · ')
          : 'Aucun exprimé'}{' '}
        <SourceBadge source="sirh" />
      </dd>
    </dl>
  )
}
