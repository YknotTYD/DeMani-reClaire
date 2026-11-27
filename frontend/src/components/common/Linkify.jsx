// Liens web (https://…, www.…) et adresses email
const PATTERN = /(https?:\/\/[^\s<]+[^\s<.,;:!?)\]]|www\.[^\s<]+[^\s<.,;:!?)\]]|[\w.+-]+@[\w-]+(?:\.[\w-]+)+)/g

function hrefOf(part) {
  if (part.includes('@') && !part.startsWith('http')) return `mailto:${part}`
  return part.startsWith('www.') ? `https://${part}` : part
}

/** Affiche un texte en rendant cliquables les liens (visio, documents…) et les emails qu'il contient. */
export default function Linkify({ text }) {
  if (!text) return null
  const parts = text.split(PATTERN)

  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <a
        key={i}
        href={hrefOf(part)}
        target={part.includes('@') && !part.startsWith('http') ? undefined : '_blank'}
        rel="noopener noreferrer"
        className="link"
        onClick={(e) => e.stopPropagation()}
      >
        {part}
      </a>
    ) : (
      part
    ),
  )
}
