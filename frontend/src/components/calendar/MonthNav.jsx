import { monthLabel } from '../../utils/calendar'

export default function MonthNav({ year, month, onChange }) {
  const shift = (delta) => {
    const d = new Date(year, month + delta, 1)
    onChange(d.getFullYear(), d.getMonth())
  }
  const today = new Date()

  return (
    <div className="month-nav">
      <button type="button" className="button--round" onClick={() => shift(-1)} aria-label="Mois précédent">
        ‹
      </button>
      <h2>{monthLabel(year, month)}</h2>
      <button type="button" className="button--round" onClick={() => shift(1)} aria-label="Mois suivant">
        ›
      </button>
      <button type="button" className="button--ghost" onClick={() => onChange(today.getFullYear(), today.getMonth())}>
        Aujourd'hui
      </button>
    </div>
  )
}
