/** Champ de recherche arrondi avec bouton pour effacer. */
export default function SearchInput({ value, onChange, placeholder = 'Rechercher…', autoFocus = false }) {
  return (
    <div className="search-input">
      <span className="search-input__icon" aria-hidden="true">
        ⌕
      </span>
      <input
        type="search"
        value={value}
        placeholder={placeholder}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
        aria-label={placeholder}
      />
      {value && (
        <button type="button" className="search-input__clear" onClick={() => onChange('')} aria-label="Effacer">
          ×
        </button>
      )}
    </div>
  )
}
