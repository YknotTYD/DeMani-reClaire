/** Fond d'ambiance : quelques taches de couleur, plus claires ou plus sombres, qui dérivent lentement. */
export default function Ambient() {
  return (
    <div className="ambient" aria-hidden="true">
      <span className="ambient__blob ambient__blob--sky" />
      <span className="ambient__blob ambient__blob--coral" />
      <span className="ambient__blob ambient__blob--navy" />
      <span className="ambient__blob ambient__blob--peach" />
    </div>
  )
}
