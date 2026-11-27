import { EVOLUTION_STATUSES } from '../../api/evolutions'

export default function EvolutionStatusSelect({ value, onChange }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      {EVOLUTION_STATUSES.map((s) => (
        <option key={s.value} value={s.value}>
          {s.label}
        </option>
      ))}
    </select>
  )
}
