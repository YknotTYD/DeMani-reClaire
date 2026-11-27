import { useState } from 'react'
import ChipGroup from '../common/ChipGroup'

const KINDS = [
  { value: 'echange', label: 'Demander un échange' },
  { value: 'correction', label: 'Demander une correction de mon profil' },
]

/** Le collaborateur sollicite lui-même son gestionnaire RH. */
export default function RequestForm({ onSend, initialKind = 'echange', initialMessage = '' }) {
  const [kind, setKind] = useState(initialKind)
  const [message, setMessage] = useState(initialMessage)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (await onSend(kind, message)) setMessage('')
  }

  return (
    <form className="stacked-form stacked-form--wide" onSubmit={handleSubmit}>
      <ChipGroup label="Type de demande" options={KINDS} value={kind} onChange={setKind} />
      <textarea
        className="note"
        rows={3}
        placeholder={kind === 'correction' ? 'Quelle information faut-il corriger ?' : 'Un mot pour préparer l’échange (facultatif)'}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        required={kind === 'correction'}
      />
      <button type="submit">Envoyer</button>
    </form>
  )
}
