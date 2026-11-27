import { useState } from 'react'
import { byName, matches } from '../../utils/text'
import Avatar from './Avatar'
import SearchInput from './SearchInput'

const SHOWN = 5

/**
 * Choix d'une personne par recherche (plutôt qu'une longue liste déroulante).
 * `people` : [{ id, name, detail }] ; `value` : id choisi (texte) ou ''.
 */
export default function PersonSelect({ people, value, onChange, placeholder = 'Rechercher une personne…' }) {
  const [query, setQuery] = useState('')
  const selected = people.find((p) => String(p.id) === String(value))

  if (selected) {
    return (
      <div className="person-selected">
        <Avatar name={selected.name} />
        <div className="soft-list__main">
          <strong>{selected.name}</strong>
          {selected.detail && <span className="muted">{selected.detail}</span>}
        </div>
        <button type="button" className="button--ghost" onClick={() => onChange('')}>
          Changer
        </button>
      </div>
    )
  }

  const found = [...people]
    .sort((a, b) => byName(a.name, b.name))
    .filter((p) => !query.trim() || matches(`${p.name} ${p.detail ?? ''}`, query))

  return (
    <div className="member-picker">
      <SearchInput value={query} onChange={setQuery} placeholder={placeholder} />
      <ul className="soft-list soft-list--compact">
        {found.slice(0, SHOWN).map((p) => (
          <li key={p.id}>
            <Avatar name={p.name} />
            <div className="soft-list__main">
              <span>{p.name}</span>
              {p.detail && <span className="muted">{p.detail}</span>}
            </div>
            <button type="button" onClick={() => onChange(String(p.id))}>
              Choisir
            </button>
          </li>
        ))}
      </ul>
      {found.length === 0 && <p className="muted">Personne ne correspond.</p>}
      {found.length > SHOWN && <p className="muted">{found.length - SHOWN} autre(s) : précise la recherche.</p>}
    </div>
  )
}
