/** Navigation semaine par semaine pour la vue agenda. */
export default function WeekNav({ weekStart, onChange }) {
  const end = new Date(weekStart)
  end.setDate(end.getDate() + 6)
  const fmt = (d) => d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  const shift = (weeks) => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + weeks * 7)
    onChange(d)
  }
  return (
    <div className="month-nav">
      <button type="button" className="button--round" onClick={() => shift(-1)} aria-label="Semaine précédente">‹</button>
      <h2 className="week-nav__title">Semaine du {fmt(weekStart)} au {fmt(end)}</h2>
      <button type="button" className="button--round" onClick={() => shift(1)} aria-label="Semaine suivante">›</button>
      <button type="button" className="button--ghost" onClick={() => onChange(null)}>Aujourd'hui</button>
    </div>
  )
}
