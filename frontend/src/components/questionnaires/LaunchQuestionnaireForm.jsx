import { useState } from 'react'
import { QUARTERS, quarterOf } from '../../utils/quarters'
import ChipGroup from '../common/ChipGroup'
import MultiChipGroup from '../common/MultiChipGroup'

/** Envoyer un modèle de questionnaire à des équipes, pour un trimestre. */
export default function LaunchQuestionnaireForm({ models, teams, onSubmit }) {
  const now = new Date()
  const usable = models.filter((m) => m.criteria.length > 0)
  const [modelId, setModelId] = useState(usable[0]?.id ?? null)
  const [year, setYear] = useState(now.getFullYear())
  const [quarter, setQuarter] = useState(quarterOf(now))
  const [teamIds, setTeamIds] = useState([])

  if (usable.length === 0) return <p className="muted">Crée d'abord un modèle avec son tableau (lignes et colonnes).</p>
  if (teams.length === 0) return <p className="muted">Crée d'abord une équipe.</p>

  const allSelected = teamIds.length === teams.length

  const handleSubmit = async (e) => {
    e.preventDefault()
    const ok = await onSubmit({ modelId, year: Number(year), quarter, teamIds })
    if (ok) setTeamIds([])
  }

  return (
    <form className="launch-form" onSubmit={handleSubmit}>
      <p className="form-label">Modèle</p>
      <ChipGroup label="Modèle" options={usable.map((m) => ({ value: m.id, label: m.name }))} value={modelId} onChange={setModelId} />

      <p className="form-label">Trimestre</p>
      <div className="form-row">
        <ChipGroup label="Trimestre" options={QUARTERS} value={quarter} onChange={setQuarter} />
        <input
          type="number"
          className="input--year"
          value={year}
          min={2000}
          max={2100}
          onChange={(e) => setYear(e.target.value)}
          aria-label="Année"
        />
      </div>

      <p className="form-label">
        Équipes destinataires{' '}
        <button type="button" className="button--link" onClick={() => setTeamIds(allSelected ? [] : teams.map((t) => t.id))}>
          {allSelected ? 'Tout désélectionner' : 'Toutes les équipes'}
        </button>
      </p>
      <MultiChipGroup label="Équipes" options={teams.map((t) => ({ value: t.id, label: t.name }))} value={teamIds} onChange={setTeamIds} />

      <button type="submit" disabled={!modelId || teamIds.length === 0}>
        Envoyer le questionnaire
      </button>
    </form>
  )
}
