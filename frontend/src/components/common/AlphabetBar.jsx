const LETTERS = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ', '#']

/** Filtre alphabétique : les lettres sans aucun nom sont grisées. Recliquer sur la lettre active l'enlève. */
export default function AlphabetBar({ available, value, onChange }) {
  return (
    <div className="alphabet" role="toolbar" aria-label="Filtrer par lettre">
      {LETTERS.map((letter) => {
        const enabled = available.has(letter)
        if (letter === '#' && !enabled) return null
        return (
          <button
            key={letter}
            type="button"
            className={letter === value ? 'alphabet__letter alphabet__letter--on' : 'alphabet__letter'}
            disabled={!enabled}
            aria-pressed={letter === value}
            onClick={() => onChange(letter === value ? null : letter)}
          >
            {letter}
          </button>
        )
      })}
    </div>
  )
}
