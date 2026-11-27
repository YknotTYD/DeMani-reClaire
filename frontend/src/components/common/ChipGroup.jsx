/** Choix unique sous forme de pastilles arrondies. `options` : [{ value, label }] */
export default function ChipGroup({ options, value, onChange, label }) {
  return (
    <div className="chip-group" role="radiogroup" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={option.value === value}
          className={option.value === value ? 'chip chip--on' : 'chip'}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
