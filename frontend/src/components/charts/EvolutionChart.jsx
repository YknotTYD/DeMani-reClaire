import { useState } from 'react'
import { splitCriteria } from '../../utils/criteria'
import { evolutionSeries } from '../../utils/evolution'
import ChipGroup from '../common/ChipGroup'
import ChartTable from './ChartTable'
import LineChart from './LineChart'

const format = (v) => v.toLocaleString('fr-FR', { maximumFractionDigits: 2 })

/** Chiffre clé : moyenne générale du dernier trimestre et écart avec le précédent. */
function LatestAverage({ points }) {
  const withValue = points.filter((p) => p.overall_average !== null)
  if (withValue.length === 0) return null
  const last = withValue.at(-1)
  const previous = withValue.at(-2)
  const delta = previous ? last.overall_average - previous.overall_average : null

  return (
    <div className="stat-tile">
      <span className="stat-tile__value">{format(last.overall_average)} ★</span>
      <span className="muted">moyenne générale, {last.label}</span>
      {delta !== null && (
        <span className={delta < 0 ? 'trend trend--down' : 'trend trend--up'}>
          {delta < 0 ? '▼' : '▲'} {format(Math.abs(delta))} depuis {previous.label}
        </span>
      )}
    </div>
  )
}

/**
 * Évolution d'un modèle de questionnaire au fil des trimestres.
 * `evolution` : réponse de /questionnaire-models/{id}/evolution (moyenne de tous ou d'un membre).
 */
export default function EvolutionChart({ evolution, title }) {
  const [rowId, setRowId] = useState('all')
  const [asTable, setAsTable] = useState(false)

  if (evolution.points.length === 0) return <p className="muted">Pas encore de réponses pour ce questionnaire.</p>
  if (evolution.points.every((p) => p.masked)) {
    return <p className="notice notice--privacy">Moins de 10 réponses à chaque trimestre : les résultats restent masqués pour préserver l'anonymat.</p>
  }

  const { rows } = splitCriteria(evolution.criteria)
  const { labels, series, hiddenColumns } = evolutionSeries(evolution, rowId === 'all' ? null : rowId)
  if (series.length === 0) return <p className="muted">Ce modèle n'a pas de colonne en étoiles : pas de courbe d'évolution.</p>
  const rowOptions = [{ value: 'all', label: 'Ensemble' }, ...rows.map((r) => ({ value: r.id, label: r.label }))]

  return (
    <div className="evolution-chart">
      <div className="evolution-chart__header">
        <LatestAverage points={evolution.points} />
        <button type="button" className="button--ghost" onClick={() => setAsTable(!asTable)}>
          {asTable ? 'Voir le graphique' : 'Voir en tableau'}
        </button>
      </div>
      {rows.length > 1 && <ChipGroup label="Ligne du tableau" options={rowOptions} value={rowId} onChange={setRowId} />}
      {asTable ? (
        <ChartTable labels={labels} series={series} />
      ) : (
        <LineChart labels={labels} series={series} ariaLabel={title} />
      )}
      {hiddenColumns > 0 && <p className="muted">5 courbes au maximum : {hiddenColumns} colonne(s) non affichée(s).</p>}
      {labels.length === 1 && <p className="muted">Un seul trimestre pour l'instant : la courbe se dessinera au prochain.</p>}
      {evolution.points.some((p) => p.masked) && (
        <p className="muted">
          Trimestres sans point : moins de 10 réponses, résultats masqués pour préserver l'anonymat (
          {evolution.points
            .filter((p) => p.masked)
            .map((p) => p.label)
            .join(', ')}
          ).
        </p>
      )}
    </div>
  )
}
