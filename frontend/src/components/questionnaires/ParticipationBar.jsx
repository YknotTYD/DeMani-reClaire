/** Taux de réponse : « 5 / 8 réponses » avec une barre arrondie. */
export default function ParticipationBar({ answered, total }) {
  const percent = total ? Math.round((answered / total) * 100) : 0

  return (
    <div className="participation" title={`${percent} %`}>
      <div className="participation__track">
        <div className="participation__fill" style={{ width: `${percent}%` }} />
      </div>
      <span className="muted">
        {answered} / {total} réponse{answered > 1 ? 's' : ''}
      </span>
    </div>
  )
}
