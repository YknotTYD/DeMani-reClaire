const MAX_STARS = 5

/** Note de 1 à 5 étoiles. Lecture seule si `onChange` n'est pas fourni. */
export default function StarRating({ value = 0, onChange }) {
  const readOnly = !onChange

  return (
    <span className={`stars ${readOnly ? 'stars--readonly' : ''}`} aria-label={`${value} sur ${MAX_STARS}`}>
      {Array.from({ length: MAX_STARS }, (_, i) => {
        const star = i + 1
        return (
          <button
            key={star}
            type="button"
            className={star <= value ? 'star star--on' : 'star'}
            disabled={readOnly}
            onClick={() => onChange?.(star)}
            aria-label={`${star} étoile${star > 1 ? 's' : ''}`}
          >
            ★
          </button>
        )
      })}
    </span>
  )
}
