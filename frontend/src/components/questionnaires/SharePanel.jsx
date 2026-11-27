/**
 * Après avoir répondu, le collaborateur décide si son gestionnaire RH peut voir ses réponses.
 * Par défaut, elles restent privées (rapport, section 6.1 : « le collaborateur voit le résultat en premier »).
 */
export default function SharePanel({ shared, onChange }) {
  return (
    <div className={shared ? 'share-panel share-panel--on' : 'share-panel'}>
      <div>
        <strong>{shared ? 'Réponses partagées avec ton gestionnaire RH' : 'Réponses privées'}</strong>
        <p className="muted">
          {shared
            ? 'Ton gestionnaire RH peut les consulter (chaque consultation apparaît dans ton profil). Tu peux arrêter le partage à tout moment.'
            : 'Le RH ne voit que des moyennes collectives (10 réponses minimum). Partager tes réponses peut aider à préparer un échange.'}
        </p>
      </div>
      <button type="button" className={shared ? 'button--ghost' : ''} onClick={() => onChange(!shared)}>
        {shared ? 'Ne plus partager' : 'Partager mes réponses'}
      </button>
    </div>
  )
}
