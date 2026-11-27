import { daysLeft, EXPIRING_SOON_DAYS } from '../../utils/retention'

/** Conservation des dossiers (référentiel CNIL 2026) : ce qui arrive à échéance, et la purge manuelle. */
export default function RetentionBanner({ candidates, onPurge }) {
  const soon = candidates.filter((c) => {
    const days = daysLeft(c)
    return days !== null && days <= EXPIRING_SOON_DAYS
  })

  return (
    <div className="notice notice--privacy retention-banner">
      <span>
        Les dossiers des candidats non retenus sont supprimés automatiquement 2 ans après le dernier contact.
        {soon.length > 0 && (
          <strong>
            {' '}
            {soon.length} dossier{soon.length > 1 ? 's arrivent' : ' arrive'} à échéance dans les {EXPIRING_SOON_DAYS} jours.
          </strong>
        )}
      </span>
      <button type="button" className="button--ghost" onClick={onPurge}>
        Supprimer les dossiers échus
      </button>
    </div>
  )
}
