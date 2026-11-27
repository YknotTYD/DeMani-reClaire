import SourceBadge from '../../components/connectors/SourceBadge'
import { listPositions } from '../../api/positions'
import AsyncContent from '../../components/common/AsyncContent'
import CandidateSearch from '../../components/cv-bot/CandidateSearch'
import CvChat from '../../components/cv-bot/CvChat'
import { useAsync } from '../../hooks/useAsync'

/** Recherche rapide d'un candidat, puis dépôt de nouveaux fichiers dans la conversation. */
export default function CvBotPage() {
  const positions = useAsync(listPositions)

  return (
    <div className="fill-page">
      <div className="title-row">
        <h1>Dépôt et recherche de CV</h1>
        <SourceBadge source="talentlink" />
      </div>
      <p className="muted page-intro">
        Complément de Talentlink, qui reste l'outil de référence des candidatures : chaque fichier rangé ici lui est transmis.
      </p>
      <CandidateSearch />
      <AsyncContent {...positions}>
        {(list) => <CvChat positions={list} onPositionsChange={positions.reload} />}
      </AsyncContent>
    </div>
  )
}
