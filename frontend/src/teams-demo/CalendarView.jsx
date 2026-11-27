import Logo from '../components/branding/Logo'
import { WEEK } from './data'

const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17]
const ROW = 52 // hauteur d'une heure, en pixels
const fmt = (h) => `${Math.floor(h)}:${h % 1 ? String(Math.round((h % 1) * 60)).padStart(2, '0') : '00'}`

/** Semaine de travail ; les rendez-vous posés par Trajectoires portent son logo. */
export default function CalendarView({ events, onOpen }) {
  return (
    <section className="tm-cal">
      <header className="tm-cal__head">
        <h2>Calendrier</h2>
        <span className="tm-muted">{WEEK.label} · Semaine de travail</span>
        <button type="button" className="tm-button tm-button--ghost">Aujourd'hui</button>
        <button type="button" className="tm-button">+ Nouvelle réunion</button>
      </header>
      <div className="tm-cal__grid" style={{ '--row': `${ROW}px` }}>
        <div className="tm-cal__hours">
          <span className="tm-cal__corner" />
          {HOURS.map((h) => <span key={h}>{h}:00</span>)}
        </div>
        {WEEK.days.map((day, d) => (
          <div key={day} className={`tm-cal__day ${d === WEEK.today ? 'is-today' : ''}`}>
            <span className="tm-cal__dayname">{day}</span>
            <div className="tm-cal__slots">
              {events.filter((e) => e.day === d).map((e) => (
                <button
                  key={e.title}
                  type="button"
                  className={`tm-event tm-event--${e.kind}`}
                  style={{ top: (e.start - HOURS[0]) * ROW, height: (e.end - e.start) * ROW - 3 }}
                  onClick={() => e.kind === 'traj' && onOpen('/calendrier')}
                >
                  <strong>{e.title}</strong>
                  <span className="tm-event__time">
                    {e.kind === 'traj' && <Logo size={12} />}
                    {fmt(e.start)} – {fmt(e.end)}
                    {e.kind === 'traj' && ' · Trajectoires'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
