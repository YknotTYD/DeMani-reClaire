/** Choix multiple sous forme de pastilles. `value` : tableau des valeurs sélectionnées. */
export default function MultiChipGroup({ options, value, onChange, label }) {
  const toggle = (v) => onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v])

  return (
    <div className="chip-group" role="group" aria-label={label}>
      {options.map((option) => {
        const on = value.includes(option.value)
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={on}
            className={on ? 'chip chip--on' : 'chip'}
            onClick={() => toggle(option.value)}
          >
            {on && '✓ '}
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
