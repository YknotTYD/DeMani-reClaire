/** Logo : une étoile filante, dorée et épaisse, avec sa traînée aux couleurs de l'application. Même dessin que public/favicon.svg. */
const STAR = 'M72.8 17.5 L82.7 31.5 L99.7 29.5 L89.4 43.2 L96.6 58.7 L80.4 53.2 L67.8 64.8 L68.0 47.8 L53.1 39.4 L69.5 34.3 Z'

export default function Logo({ size = 48 }) {
  return (
    <svg className="logo" width={size} height={size} viewBox="0 0 120 120" role="img" aria-label="Trajectoires">
      <circle cx="60" cy="60" r="58" fill="#e6eefb" />
      <path className="logo__trail" pathLength="1" d="M22 100 L58 66" stroke="#ff8f87" strokeWidth="11" strokeLinecap="round" />
      <path className="logo__trail" pathLength="1" d="M30 76 L50 58" stroke="#ffb77a" strokeWidth="9" strokeLinecap="round" />
      <path className="logo__trail" pathLength="1" d="M50 104 L66 89" stroke="#43b8eb" strokeWidth="9" strokeLinecap="round" />
      <path className="logo__star" d={STAR} fill="#ffc24b" stroke="#ffc24b" strokeWidth="9" strokeLinejoin="round" />
      <circle className="logo__spark" cx="99" cy="80" r="4" fill="#ffb77a" />
      <circle className="logo__spark logo__spark--late" cx="40" cy="30" r="3" fill="#43b8eb" />
    </svg>
  )
}
