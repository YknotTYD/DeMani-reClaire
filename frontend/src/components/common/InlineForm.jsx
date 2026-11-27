import { useState } from 'react'

/** Petit formulaire « un champ + un bouton », réutilisé pour créer équipes, critères, questionnaires. */
export default function InlineForm({ placeholder, buttonLabel = 'Ajouter', initialValue = '', onSubmit }) {
  const [value, setValue] = useState(initialValue)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const trimmed = value.trim()
    if (!trimmed) return
    const ok = await onSubmit(trimmed)
    if (ok !== false) setValue('')
  }

  return (
    <form className="inline-form" onSubmit={handleSubmit}>
      <input value={value} onChange={(e) => setValue(e.target.value)} placeholder={placeholder} />
      <button type="submit">{buttonLabel}</button>
    </form>
  )
}
