import { useState } from 'react'
import ChipGroup from '../common/ChipGroup'

/** Choix du poste visé parmi les postes existants, ou création d'un nouveau poste. */
export default function PositionPicker({ positions, value, onChange, onCreate }) {
  const [wantsToCreate, setCreating] = useState(false)
  const creating = wantsToCreate || positions.length === 0
  const [name, setName] = useState('')

  const handleCreate = async () => {
    const trimmed = name.trim()
    if (!trimmed) return
    const position = await onCreate(trimmed)
    if (position) {
      onChange(position.id)
      setName('')
      setCreating(false)
    }
  }

  return (
    <div className="position-picker">
      <ChipGroup
        label="Poste visé"
        options={positions.map((p) => ({ value: p.id, label: p.name }))}
        value={value}
        onChange={onChange}
      />
      {creating ? (
        <div className="inline-form">
          <input
            autoFocus
            placeholder="Nom du nouveau poste"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleCreate())}
          />
          <button type="button" onClick={handleCreate}>
            Créer
          </button>
        </div>
      ) : (
        <button type="button" className="chip chip--add" onClick={() => setCreating(true)}>
          + Nouveau poste
        </button>
      )}
    </div>
  )
}
