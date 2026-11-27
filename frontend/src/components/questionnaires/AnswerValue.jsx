import StarRating from '../common/StarRating'

const formatNumber = (v) => v.toLocaleString('fr-FR', { maximumFractionDigits: 2 })

/** Affichage d'une réponse, quel que soit son type. */
export default function AnswerValue({ column, value }) {
  if (value === undefined || value === null || value === '') return <span className="muted">—</span>
  switch (column.answer_type) {
    case 'stars':
      return <StarRating value={value} />
    case 'yes_no':
      return <span className={value ? 'yes-no yes-no--yes' : 'yes-no yes-no--no'}>{value ? 'Oui' : 'Non'}</span>
    case 'number':
      return <strong>{formatNumber(value)}</strong>
    case 'text':
      return <span className="answer-text">« {value} »</span>
    default:
      return <span className="chip chip--static">{value}</span>
  }
}
