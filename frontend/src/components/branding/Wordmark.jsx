/**
 * Logotype « Trajectoires » : le nom en police de marque, posé sur une ligne
 * qui le souligne comme un coup de surligneur.
 * `size` : taille du texte en pixels.
 */
export default function Wordmark({ size = 24, className = '' }) {
  return (
    <span className={`wordmark ${className}`} style={{ fontSize: size }} role="img" aria-label="Trajectoires">
      <span className="wordmark__text" aria-hidden="true">
        Trajectoires
      </span>
    </span>
  )
}
