import { useState } from 'react'
import { byName, matches } from '../../utils/text'
import Avatar from '../common/Avatar'
import SearchInput from '../common/SearchInput'

const SHOWN = 5

/**
 * Ajout de membres par recherche : on tape quelques lettres, on clique sur « Ajouter ».
 * Plusieurs membres peuvent être ajoutés à la suite.
 */
export default function MemberPicker({ members, excludedIds = [], onAdd, emptyText = 'Tous les membres sont déjà ajoutés.' }) {
  const [query, setQuery] = useState('')
  const excluded = new Set(excludedIds)
  const available = members.filter((m) => !excluded.has(m.id)).sort((a, b) => byName(a.name, b.name))

  if (available.length === 0) return <p className="muted">{emptyText}</p>

  const found = available.filter((m) => !query.trim() || matches(`${m.name} ${m.email}`, query))
  const shown = found.slice(0, SHOWN)

  return (
    <div className="member-picker">
      <SearchInput value={query} onChange={setQuery} placeholder="Ajouter un membre : tape son nom…" />
      <ul className="soft-list soft-list--compact">
        {shown.map((m) => (
          <li key={m.id}>
            <Avatar name={m.name} />
            <div className="soft-list__main">
              <span>{m.name}</span>
              <span className="muted">{m.email}</span>
            </div>
            <button type="button" onClick={() => onAdd(m)}>
              + Ajouter
            </button>
          </li>
        ))}
      </ul>
      {found.length === 0 && <p className="muted">Aucun membre ne correspond.</p>}
      {found.length > SHOWN && <p className="muted">{found.length - SHOWN} autre(s) : précise la recherche.</p>}
    </div>
  )
}
