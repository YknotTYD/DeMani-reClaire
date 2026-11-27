import { useState } from 'react'
import { PEOPLE } from './data'
import TmAvatar from './TmAvatar'
import TrajectoiresCard from './TrajectoiresCard'
import TrajectoiresFrame from './TrajectoiresFrame'

/** Équipes et canaux ; le canal Carrières a un onglet Trajectoires épinglé. */
export default function TeamsView({ teams, persona, theme, onOpen }) {
  const [current, setCurrent] = useState({ team: teams[0].id, channel: teams[0].channels.find((c) => c.trajectoiresTab)?.id ?? teams[0].channels[0].id })
  const [tab, setTab] = useState('publications')
  const team = teams.find((t) => t.id === current.team)
  const channel = team.channels.find((c) => c.id === current.channel)

  return (
    <>
      <aside className="tm-list">
        <div className="tm-list__head"><h2>Équipes</h2></div>
        {teams.map((t) => (
          <div key={t.id} className="tm-team">
            <p className="tm-team__name">
              <span className="tm-team__tile" style={{ background: t.color }}>{t.initials}</span>
              {t.name}
            </p>
            {t.channels.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`tm-team__channel ${current.team === t.id && current.channel === c.id ? 'is-active' : ''}`}
                onClick={() => {
                  setCurrent({ team: t.id, channel: c.id })
                  setTab('publications')
                }}
              >
                {c.name}
              </button>
            ))}
          </div>
        ))}
      </aside>
      <section className="tm-conv">
        <header className="tm-conv__head">
          <span className="tm-team__tile" style={{ background: team.color }}>{team.initials}</span>
          <div>
            <strong>{channel.name}</strong>
            <span className="tm-muted">{team.name}</span>
          </div>
          <nav className="tm-tabs">
            <span className={tab === 'publications' ? 'is-active' : ''} onClick={() => setTab('publications')}>Publications</span>
            <span>Fichiers</span>
            {channel.trajectoiresTab && (
              <span className={tab === 'trajectoires' ? 'is-active' : ''} onClick={() => setTab('trajectoires')}>Trajectoires</span>
            )}
            <span className="tm-tabs__add">+</span>
          </nav>
        </header>
        {tab === 'trajectoires' ? (
          <TrajectoiresFrame persona={persona} theme={theme} path="/alertes" />
        ) : (
          <div className="tm-conv__messages tm-posts">
            {channel.posts.map((p, i) => (
              <article key={i} className="tm-post">
                <TmAvatar person={PEOPLE[p.from]} size={32} presence={null} />
                <div className="tm-post__body">
                  <span className="tm-msg__meta"><strong>{PEOPLE[p.from].name}</strong> {p.time}</span>
                  {p.card ? <TrajectoiresCard card={p.card} onOpen={onOpen} /> : <p>{p.text}</p>}
                  {p.file && <span className="tm-file">{p.file}</span>}
                  {p.replies > 0 && <span className="tm-post__replies">{p.replies} réponse{p.replies > 1 ? 's' : ''}</span>}
                </div>
              </article>
            ))}
            <button type="button" className="tm-newpost">Démarrer une publication</button>
          </div>
        )}
      </section>
    </>
  )
}
