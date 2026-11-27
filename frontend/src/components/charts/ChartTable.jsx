const format = (v) => (v === null || v === undefined ? '—' : v.toLocaleString('fr-FR', { maximumFractionDigits: 2 }))

/** Les mêmes données que le graphique, en tableau (accessibilité, impression). */
export default function ChartTable({ labels, series }) {
  return (
    <table className="table">
      <thead>
        <tr>
          <th>Trimestre</th>
          {series.map((s) => (
            <th key={s.key}>{s.name}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {labels.map((label, i) => (
          <tr key={label}>
            <th scope="row">{label}</th>
            {series.map((s) => (
              <td key={s.key}>{format(s.values[i])}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
