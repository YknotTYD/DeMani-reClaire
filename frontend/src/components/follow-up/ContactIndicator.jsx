import CountUp from '../common/CountUp'

/** Indicateur du rapport (tableau 23) : part des collaborateurs ayant eu un échange dans les 12 mois. Cible : 95 %. */
export default function ContactIndicator({ indicator }) {
  const target = 95
  return (
    <div className="stat-tile">
      <span className="stat-tile__value"><CountUp value={indicator.percent} /> %</span>
      <span className="muted">
        des collaborateurs vus dans les 12 derniers mois ({indicator.contacted} sur {indicator.total}) · cible {target} %
      </span>
      <div className="participation__track">
        <div className="participation__fill" style={{ width: `${indicator.percent}%` }} />
      </div>
    </div>
  )
}
