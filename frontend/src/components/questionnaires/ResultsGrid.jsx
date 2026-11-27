import { useState } from 'react'
import { cellKey } from '../../utils/criteria'
import StarRating from '../common/StarRating'

const format = (v) => v.toLocaleString('fr-FR', { maximumFractionDigits: 2 })

/** Répartition des réponses d'un choix dans une liste, en petites barres. */
function ChoiceBars({ choices, count }) {
  return (
    <span className="choice-bars">
      {Object.entries(choices).map(([option, n]) => (
        <span key={option} className="choice-bars__row">
          <span className="choice-bars__label">{option}</span>
          <span className="choice-bars__track">
            <span className="choice-bars__fill" style={{ width: `${count ? (n / count) * 100 : 0}%` }} />
          </span>
          <span className="muted">{n}</span>
        </span>
      ))}
    </span>
  )
}

/** Textes libres d'une case : les 2 premiers, puis « voir tout ». Jamais le nom de l'auteur. */
function TextAnswers({ texts }) {
  const [open, setOpen] = useState(false)
  const shown = open ? texts : texts.slice(0, 2)
  return (
    <span className="text-answers">
      {shown.map((t, i) => (
        <span key={i} className="answer-text">
          « {t} »
        </span>
      ))}
      {texts.length > 2 && (
        <button type="button" className="button--link" onClick={() => setOpen(!open)}>
          {open ? 'Réduire' : `Voir les ${texts.length} réponses`}
        </button>
      )}
    </span>
  )
}

function CellResult({ column, stat }) {
  if (!stat) return <span className="muted">—</span>
  switch (column.answer_type) {
    case 'stars':
      return (
        <span className="average-cell">
          <StarRating value={Math.round(stat.average)} />
          <strong>{format(stat.average)}</strong>
        </span>
      )
    case 'number':
      return (
        <span>
          moyenne <strong>{format(stat.average)}</strong>
        </span>
      )
    case 'yes_no':
      return (
        <span>
          <strong>{stat.yes_percent} %</strong> de oui
        </span>
      )
    case 'choice':
      return <ChoiceBars choices={stat.choices} count={stat.count} />
    case 'text':
      return <TextAnswers texts={stat.texts} />
    default:
      return null
  }
}

/** Résultats d'un questionnaire, case par case, selon le type de chaque colonne. */
export default function ResultsGrid({ rows, columns, cells }) {
  const byCell = Object.fromEntries(cells.map((c) => [cellKey(c.row_id, c.column_id), c]))

  return (
    <div className="table-scroll">
      <table className="table answer-grid">
        <thead>
          <tr>
            <th />
            {columns.map((col) => (
              <th key={col.id}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <th scope="row">{row.label}</th>
              {columns.map((col) => (
                <td key={col.id}>
                  <CellResult column={col} stat={byCell[cellKey(row.id, col.id)]} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
