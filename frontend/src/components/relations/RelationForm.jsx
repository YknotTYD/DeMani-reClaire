import { useState } from 'react'
import { RELATION_KINDS, relationKind } from '../../utils/relations'
import ChipGroup from '../common/ChipGroup'

/** Enregistre un lien de travail entre deux membres : tuteur, parrain, binôme ou remplaçant. Aucune note. */
export default function RelationForm({ members, onSave }) {
  const [memberA, setMemberA] = useState('')
  const [memberB, setMemberB] = useState('')
  const [kind, setKind] = useState('binome')

  if (members.length < 2) return <p className="muted">Il faut au moins deux membres pour créer un lien.</p>

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!memberA || !memberB || memberA === memberB) return
    const ok = await onSave(Number(memberA), Number(memberB), kind)
    if (ok) {
      setMemberA('')
      setMemberB('')
    }
  }

  const memberSelect = (value, onChange, excludedId) => (
    <select value={value} onChange={(e) => onChange(e.target.value)} required>
      <option value="">Membre…</option>
      {members
        .filter((m) => String(m.id) !== excludedId)
        .map((m) => (
          <option key={m.id} value={m.id}>
            {m.name}
          </option>
        ))}
    </select>
  )

  return (
    <form className="relation-form" onSubmit={handleSubmit}>
      <ChipGroup label="Type de lien" options={RELATION_KINDS} value={kind} onChange={setKind} />
      <div className="inline-form">
        {memberSelect(memberA, setMemberA, memberB)}
        <span className="muted">{relationKind(kind).verb}</span>
        {memberSelect(memberB, setMemberB, memberA)}
        <button type="submit">Enregistrer le lien</button>
      </div>
    </form>
  )
}
