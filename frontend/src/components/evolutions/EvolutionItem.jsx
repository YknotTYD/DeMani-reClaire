import { useState } from 'react'
import { Link } from 'react-router-dom'
import { formatDate } from '../../utils/dates'
import EvolutionStatusSelect from './EvolutionStatusSelect'

/** Un membre qui souhaite évoluer : le RH choisit le statut et note ce qui a été proposé. */
export default function EvolutionItem({ evolution, onSave }) {
  const [status, setStatus] = useState(evolution.status)
  const [note, setNote] = useState(evolution.note)
  const changed = status !== evolution.status || note !== evolution.note

  return (
    <li className={evolution.status === 'fait' ? 'alert alert--seen' : 'alert'}>
      <div className="alert__header">
        <Link to={`/membres/${evolution.member_id}`}>{evolution.member_name}</Link>
        <span className="muted">
          {evolution.period} · {formatDate(evolution.created_at)}
        </span>
        <EvolutionStatusSelect value={status} onChange={setStatus} />
      </div>
      <textarea
        className="note"
        rows={2}
        placeholder="Ce qui a été proposé ou discuté…"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <button type="button" disabled={!changed} onClick={() => onSave(evolution.id, status, note)}>
        Enregistrer
      </button>
    </li>
  )
}
