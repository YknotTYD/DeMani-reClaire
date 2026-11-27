import { useState } from 'react'
import { initialOf, matches } from '../../utils/text'
import AlphabetBar from './AlphabetBar'
import SearchInput from './SearchInput'

const COLLAPSE_AFTER = 5

/**
 * Enveloppe une liste qui peut s'allonger :
 * - au-delà de 5 éléments, seuls les 5 premiers sont affichés, avec « Tout afficher » ;
 * - une recherche (sans accents, plusieurs mots possibles) apparaît ;
 * - avec `alphabetical`, une barre A–Z filtre par première lettre de `getName`.
 *
 * `children(visibleItems)` affiche la liste elle-même : les composants de liste existants sont réutilisés tels quels.
 */
export default function SearchableList({
  items,
  getText,
  getName,
  alphabetical = false,
  placeholder = 'Rechercher…',
  noMatchText = 'Aucun résultat.',
  limit = COLLAPSE_AFTER,
  children,
}) {
  const [query, setQuery] = useState('')
  const [letter, setLetter] = useState(null)
  const [expanded, setExpanded] = useState(false)

  const long = items.length > limit
  if (!long) return children(items)

  const filtering = Boolean(query.trim() || letter)
  const filtered = items.filter(
    (item) => (!query.trim() || matches(getText(item), query)) && (!letter || initialOf(getName(item)) === letter),
  )
  const visible = filtering || expanded ? filtered : filtered.slice(0, limit)
  const hidden = filtered.length - visible.length

  return (
    <div className="searchable">
      <div className="searchable__tools">
        <SearchInput value={query} onChange={setQuery} placeholder={placeholder} />
        {alphabetical && (
          <AlphabetBar
            available={new Set(items.map((item) => initialOf(getName(item))))}
            value={letter}
            onChange={setLetter}
          />
        )}
      </div>

      {visible.length === 0 ? <p className="muted">{noMatchText}</p> : children(visible)}

      {!filtering && (
        <button type="button" className="searchable__more button--ghost" onClick={() => setExpanded(!expanded)}>
          {expanded ? 'Réduire' : `Tout afficher (${hidden} de plus)`}
        </button>
      )}
      {filtering && (
        <p className="muted searchable__count">
          {filtered.length} sur {items.length}
        </p>
      )}
    </div>
  )
}
