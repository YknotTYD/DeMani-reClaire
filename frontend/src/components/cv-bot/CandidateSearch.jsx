import { useState } from 'react'
import { searchCandidates } from '../../api/candidates'
import { useAsync } from '../../hooks/useAsync'
import { useDebounced } from '../../hooks/useDebounced'
import AsyncContent from '../common/AsyncContent'
import SearchInput from '../common/SearchInput'
import CandidateResult from './CandidateResult'

/** Recherche rapide : on tape un nom (ou un email), on obtient tout ce qui concerne le candidat. */
export default function CandidateSearch() {
  const [query, setQuery] = useState('')
  const debounced = useDebounced(query.trim())
  const results = useAsync(() => (debounced ? searchCandidates(debounced) : Promise.resolve(null)), [debounced])

  return (
    <section className="panel candidate-search">
      <SearchInput value={query} onChange={setQuery} placeholder="Rechercher un candidat : nom ou email…" />
      {debounced && (
        <AsyncContent {...results}>
          {(list) =>
            list === null ? null : list.length === 0 ? (
              <p className="muted">Aucun candidat ne correspond à « {debounced} ».</p>
            ) : (
              <div className="results">
                {list.map((c) => (
                  <CandidateResult key={c.id} candidate={c} />
                ))}
              </div>
            )
          }
        </AsyncContent>
      )}
    </section>
  )
}
