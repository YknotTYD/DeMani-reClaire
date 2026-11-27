import Logo from '../components/branding/Logo'
import Icon from './icons'
import { APPS } from './data'

/** Catalogue d'applications : Trajectoires figure parmi les applications créées pour l'organisation. */
export default function AppsView({ onOpenApp }) {
  const tile = (app) => (
    <article key={app.id} className={`tm-app ${app.id === 'trajectoires' ? 'tm-app--featured' : ''}`}>
      <span className="tm-app__icon" style={{ background: app.color ?? (app.id === 'trajectoires' ? '#e6eefb' : '#43b8eb') }}>
        {app.id === 'trajectoires' ? <Logo size={34} /> : app.name[0]}
      </span>
      <div className="tm-app__text">
        <strong>{app.name}</strong>
        <span className="tm-muted">{app.by}</span>
        <p>{app.text}</p>
      </div>
      {app.added ? (
        <button type="button" className="tm-button" onClick={() => onOpenApp(app.id)}>Ouvrir</button>
      ) : app.soon ? (
        <span className="tm-pill">Bientôt</span>
      ) : (
        <button type="button" className="tm-button tm-button--ghost">Ajouter</button>
      )}
    </article>
  )
  return (
    <section className="tm-store">
      <header className="tm-store__head">
        <h2>Applications</h2>
        <label className="tm-search tm-search--light">
          <Icon name="search" size={16} />
          <input placeholder="Rechercher des applications" />
        </label>
      </header>
      <h3>Créées pour votre organisation</h3>
      <div className="tm-store__grid">{APPS.filter((a) => a.org).map(tile)}</div>
      <h3>Populaires</h3>
      <div className="tm-store__grid">{APPS.filter((a) => !a.org).map(tile)}</div>
    </section>
  )
}
