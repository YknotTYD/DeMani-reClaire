import { useState } from 'react'
import MemberPicker from './MemberPicker'

/** Création d'une équipe avec, si on veut, ses membres d'un coup. */
export default function TeamCreateForm({ members, onCreate }) {
  const [name, setName] = useState('')
  const [selected, setSelected] = useState([])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    const ok = await onCreate(name.trim(), selected.map((m) => m.id))
    if (ok) {
      setName('')
      setSelected([])
    }
  }

  return (
    <form className="stacked-form stacked-form--wide" onSubmit={handleSubmit}>
      <input placeholder="Nom de la nouvelle équipe" value={name} onChange={(e) => setName(e.target.value)} required />
      {selected.length > 0 && (
        <div className="chip-group">
          {selected.map((m) => (
            <button
              key={m.id}
              type="button"
              className="chip chip--on"
              onClick={() => setSelected(selected.filter((x) => x.id !== m.id))}
              title="Retirer"
            >
              {m.name} ×
            </button>
          ))}
        </div>
      )}
      <MemberPicker
        members={members}
        excludedIds={selected.map((m) => m.id)}
        onAdd={(m) => setSelected([...selected, m])}
        emptyText={members.length === 0 ? 'Aucun membre créé pour le moment.' : 'Tous les membres sont sélectionnés.'}
      />
      <button type="submit">
        Créer l'équipe{selected.length > 0 && ` avec ${selected.length} membre${selected.length > 1 ? 's' : ''}`}
      </button>
    </form>
  )
}
