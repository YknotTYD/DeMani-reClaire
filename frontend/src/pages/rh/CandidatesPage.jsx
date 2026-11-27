import SourceBadge from '../../components/connectors/SourceBadge'
import { Link } from 'react-router-dom'
import { listCandidates, purgeExpiredCandidates } from '../../api/candidates'
import { deletePosition, listPositions, renamePosition } from '../../api/positions'
import PositionSection from '../../components/candidates/PositionSection'
import RetentionBanner from '../../components/candidates/RetentionBanner'
import AsyncContent from '../../components/common/AsyncContent'
import ErrorMessage from '../../components/common/ErrorMessage'
import { useState } from 'react'
import { useAction } from '../../hooks/useAction'
import { useAsync } from '../../hooks/useAsync'

/** Les dossiers : un poste, puis ses candidats. */
export default function CandidatesPage() {
  const positions = useAsync(listPositions)
  const candidates = useAsync(listCandidates)
  const { run, error } = useAction()
  const [purged, setPurged] = useState(null)

  const act = async (action) => {
    const ok = await run(action)
    if (ok) {
      positions.reload()
      candidates.reload()
    }
    return ok
  }

  return (
    <>
      <div className="title-row">
        <h1>Candidats</h1>
        <SourceBadge source="talentlink" />
      </div>
      <ErrorMessage message={error} />
      {candidates.data && (
        <RetentionBanner
          candidates={candidates.data}
          onPurge={() =>
            act(async () => {
              const result = await purgeExpiredCandidates()
              setPurged(result.deleted)
            })
          }
        />
      )}
      {purged !== null && <p className="success">{purged} dossier(s) échu(s) supprimé(s).</p>}
      <AsyncContent {...positions}>
        {(list) =>
          list.length === 0 ? (
            <p className="muted">
              Aucun poste pour le moment. Dépose un premier CV dans <Link to="/depot-cv">Dépôt de CV</Link>.
            </p>
          ) : (
            list.map((position) => (
              <PositionSection
                key={position.id}
                position={position}
                candidates={(candidates.data ?? []).filter((c) => c.position_id === position.id)}
                onRename={(id, name) => act(() => renamePosition(id, name))}
                onDelete={(id) => act(() => deletePosition(id))}
              />
            ))
          )
        }
      </AsyncContent>
    </>
  )
}
