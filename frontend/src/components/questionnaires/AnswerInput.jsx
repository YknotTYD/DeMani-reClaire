import StarRating from '../common/StarRating'

/**
 * Saisie d'une réponse selon le type de la colonne :
 * étoiles, nombre (avec minimum / maximum), oui / non, choix dans une liste ou texte libre.
 */
export default function AnswerInput({ column, value, onChange, label }) {
  switch (column.answer_type) {
    case 'stars':
      return <StarRating value={value ?? 0} onChange={onChange} />

    case 'number':
      return (
        <input
          type="number"
          className="input--number"
          value={value ?? ''}
          min={column.min_value ?? undefined}
          max={column.max_value ?? undefined}
          step="any"
          aria-label={label}
          onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
        />
      )

    case 'yes_no':
      return (
        <span className="segmented" role="radiogroup" aria-label={label}>
          {[
            { v: true, text: 'Oui' },
            { v: false, text: 'Non' },
          ].map(({ v, text }) => (
            <button
              key={text}
              type="button"
              role="radio"
              aria-checked={value === v}
              className={value === v ? 'segmented__option segmented__option--on' : 'segmented__option'}
              onClick={() => onChange(v)}
            >
              {text}
            </button>
          ))}
        </span>
      )

    case 'choice':
      return (
        <select value={value ?? ''} onChange={(e) => onChange(e.target.value || null)} aria-label={label}>
          <option value="">Choisir…</option>
          {column.options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      )

    case 'text':
      return (
        <textarea
          className="answer-textarea"
          rows={2}
          maxLength={2000}
          value={value ?? ''}
          placeholder={column.required ? '' : 'Facultatif'}
          aria-label={label}
          onChange={(e) => onChange(e.target.value)}
        />
      )

    default:
      return null
  }
}
