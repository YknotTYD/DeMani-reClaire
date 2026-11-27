import { useState } from 'react'
import Logo from '../components/branding/Logo'
import TrajectoiresFrame from './TrajectoiresFrame'

/** L'application Trajectoires ouverte depuis la barre de gauche : onglets Accueil et À propos. */
export default function TrajectoiresTab({ persona, theme, path }) {
  const [tab, setTab] = useState('accueil')
  return (
    <section className="tm-conv tm-apptab">
      <header className="tm-conv__head">
        <Logo size={28} />
        <strong>Trajectoires</strong>
        <nav className="tm-tabs">
          <span className={tab === 'accueil' ? 'is-active' : ''} onClick={() => setTab('accueil')}>Accueil</span>
          <span className={tab === 'apropos' ? 'is-active' : ''} onClick={() => setTab('apropos')}>À propos</span>
        </nav>
      </header>
      {tab === 'accueil' ? (
        <TrajectoiresFrame persona={persona} theme={theme} path={path} />
      ) : (
        <div className="tm-about">
          <Logo size={72} />
          <h2>Trajectoires</h2>
          <p className="tm-muted">Version 1.0 · Créée pour BPALC · Ressources humaines</p>
          <p>
            Le suivi des parcours des collaborateurs, dans Teams. Trajectoires se branche sur le SIRH, le CRM RH et
            Talentlink sans les remplacer : les données restent dans leur outil d'origine.
          </p>
          <h3>Autorisations</h3>
          <ul>
            <li>Connaître votre identité (compte professionnel)</li>
            <li>Vous envoyer des notifications</li>
          </ul>
          <h3>Règles d'usage</h3>
          <ul>
            <li>Aucun score individuel ; résultats collectifs à partir de 10 personnes</li>
            <li>Chaque consultation d'un profil est journalisée et visible par le collaborateur</li>
            <li>Aucune donnée nominative confiée à l'IA générative</li>
          </ul>
        </div>
      )}
    </section>
  )
}
