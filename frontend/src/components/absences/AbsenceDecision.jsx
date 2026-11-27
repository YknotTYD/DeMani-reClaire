import { useState } from 'react'

/** Le RH valide ou refuse une absence, avec un mot facultatif pour le collaborateur. */
export default function AbsenceDecision({ absence, onDecide }) {
  const [comment, setComment] = useState(absence.rh_comment)
  const decided = absence.status !== 'en_attente'
  return (
    <div className="absence-decision">
      <input value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Mot pour le collaborateur (facultatif)" />
      <button type="button" disabled={absence.status === 'validee'} onClick={() => onDecide(absence.id, 'validee', comment)}>
        Valider
      </button>
      <button type="button" className="button--ghost" disabled={absence.status === 'refusee'} onClick={() => onDecide(absence.id, 'refusee', comment)}>
        Refuser
      </button>
      {decided && (
        <button type="button" className="text-link" onClick={() => onDecide(absence.id, 'en_attente', comment)}>
          Remettre à traiter
        </button>
      )}
    </div>
  )
}
