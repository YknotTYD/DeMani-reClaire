import { formatDate } from '../../utils/dates'

/**
 * Signaux sur ses propres réponses (baisse d'au moins 2 étoiles), visibles par le collaborateur seul.
 * C'est lui qui décide de demander un échange : le RH n'en est pas informé autrement.
 */
export default function SignalList({ signals, onAsk, onSeen }) {
  if (signals.length === 0) return <p className="muted">Rien à signaler sur tes dernières réponses.</p>

  return (
    <ul className="alert-list">
      {signals.map((s) => (
        <li key={s.id} className={s.seen ? 'alert alert--seen' : 'alert alert--signal'}>
          <div className="alert__header">
            <strong>{s.period}</strong>
            <span className="muted">{formatDate(s.created_at)}</span>
          </div>
          <p>Tes réponses ont nettement baissé par rapport au trimestre précédent :</p>
          <ul className="alert__details">
            {s.details.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
          <p className="muted">Si tu le souhaites, tu peux demander un échange avec ton gestionnaire RH. Sinon, rien n'est transmis.</p>
          <div className="form-row">
            <button type="button" onClick={() => onAsk(s)}>
              Demander un échange
            </button>
            {!s.seen && (
              <button type="button" className="button--ghost" onClick={() => onSeen(s.id)}>
                Ça va, merci
              </button>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}
