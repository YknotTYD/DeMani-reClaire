import { useState } from 'react'

const EMPTY = { name: '', email: '', password: '', hired_on: '' }

/** Création d'un compte membre par le RH (le membre s'en sert pour remplir ses questionnaires). */
export default function MemberForm({ onSubmit }) {
  const [form, setForm] = useState(EMPTY)

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    const ok = await onSubmit({ ...form, hired_on: form.hired_on || null })
    if (ok) setForm(EMPTY)
  }

  return (
    <form className="stacked-form" onSubmit={handleSubmit}>
      <input placeholder="Nom" value={form.name} onChange={update('name')} required />
      <input type="email" placeholder="Email" value={form.email} onChange={update('email')} required />
      <input
        type="password"
        placeholder="Mot de passe initial (6 caractères min.)"
        value={form.password}
        onChange={update('password')}
        minLength={6}
        required
      />
      <label className="inline-label">
        Date d'embauche
        <input type="date" value={form.hired_on} onChange={update('hired_on')} />
      </label>
      <button type="submit">Créer le membre</button>
    </form>
  )
}
