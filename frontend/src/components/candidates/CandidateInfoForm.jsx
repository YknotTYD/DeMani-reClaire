import { useState } from 'react'
import { CANDIDATE_STATUSES } from '../../utils/recruitment'
import ChipGroup from '../common/ChipGroup'

/** Nom, email et statut du candidat. Renommer le candidat renomme aussi son dossier. */
export default function CandidateInfoForm({ candidate, onSave }) {
  const [form, setForm] = useState({ name: candidate.name, email: candidate.email, status: candidate.status })
  const changed =
    form.name !== candidate.name || form.email !== candidate.email || form.status !== candidate.status

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(form)
  }

  return (
    <form className="stacked-form" onSubmit={handleSubmit}>
      <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
      <input
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />
      <ChipGroup
        label="Statut"
        options={CANDIDATE_STATUSES}
        value={form.status}
        onChange={(status) => setForm({ ...form, status })}
      />
      <button type="submit" disabled={!changed}>
        Enregistrer
      </button>
    </form>
  )
}
