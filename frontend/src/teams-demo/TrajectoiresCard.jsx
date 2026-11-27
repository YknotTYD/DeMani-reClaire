import Logo from '../components/branding/Logo'

/** Carte envoyée par l'application Trajectoires dans une conversation ou un canal. */
export default function TrajectoiresCard({ card, onOpen }) {
  return (
    <div className="tm-card">
      <div className="tm-card__head">
        <Logo size={18} />
        <span>Trajectoires</span>
        {card.source && <span className="tm-card__source">via {card.source}</span>}
      </div>
      <strong>{card.title}</strong>
      <p>{card.body}</p>
      <button type="button" className="tm-button" onClick={() => onOpen(card.action.path)}>
        {card.action.label}
      </button>
    </div>
  )
}
