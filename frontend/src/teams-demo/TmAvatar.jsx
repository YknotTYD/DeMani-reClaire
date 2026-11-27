import Logo from '../components/branding/Logo'
import { PEOPLE } from './data'

const initials = (name) => name.split(' ').map((p) => p[0]).slice(0, 2).join('')

/** Avatar Teams : initiales sur fond coloré, pastille de présence ; l'application a son logo. */
export default function TmAvatar({ person, size = 32, presence, group }) {
  if (group) {
    return (
      <span className="tm-avatar tm-avatar--group" style={{ width: size, height: size }}>
        {group.slice(0, 2).map((id) => (
          <span key={id} style={{ background: PEOPLE[id].color }}>{initials(PEOPLE[id].name)[0]}</span>
        ))}
      </span>
    )
  }
  if (person.app) {
    return (
      <span className="tm-avatar tm-avatar--app" style={{ width: size, height: size }}>
        <Logo size={size - 4} />
      </span>
    )
  }
  const state = presence ?? person.presence
  return (
    <span className="tm-avatar" style={{ width: size, height: size, background: person.color, fontSize: size * 0.38 }}>
      {initials(person.name)}
      {state && <span className={`tm-presence tm-presence--${state}`} />}
    </span>
  )
}
