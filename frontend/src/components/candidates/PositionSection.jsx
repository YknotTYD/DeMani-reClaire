import { useState } from 'react'
import DeleteButton from '../common/DeleteButton'
import InlineForm from '../common/InlineForm'
import SearchableList from '../common/SearchableList'
import CandidateList from './CandidateList'

/** Un poste (= un dossier) et ses candidats. Le poste peut être renommé, ou supprimé s'il est vide. */
export default function PositionSection({ position, candidates, onRename, onDelete }) {
  const [renaming, setRenaming] = useState(false)

  return (
    <section className="panel">
      <div className="panel__header">
        {renaming ? (
          <InlineForm
            initialValue={position.name}
            buttonLabel="Valider"
            onSubmit={async (name) => {
              const ok = await onRename(position.id, name)
              if (ok) setRenaming(false)
              return ok
            }}
          />
        ) : (
          <h2>
            {position.name} <span className="muted">· {candidates.length}</span>
          </h2>
        )}
        <div className="panel__actions">
          <button type="button" className="button--ghost" onClick={() => setRenaming(!renaming)}>
            {renaming ? 'Annuler' : 'Renommer'}
          </button>
          {candidates.length === 0 && (
            <DeleteButton confirmMessage={`Supprimer le poste ${position.name} ?`} onDelete={() => onDelete(position.id)} />
          )}
        </div>
      </div>
      <SearchableList
        items={candidates}
        getText={(c) => `${c.name} ${c.email}`}
        getName={(c) => c.name}
        alphabetical
        placeholder={`Rechercher dans ${position.name}…`}
      >
        {(visible) => <CandidateList candidates={visible} />}
      </SearchableList>
    </section>
  )
}
