/**
 * Trajectoires est-il affiché dans la maquette de Teams de la démo (page /teams, même site) ?
 * Dans ce cas, on le signale à la page (attribut data-host) pour alléger l'interface.
 */
export function detectDemoHost() {
  try {
    if (window.self !== window.top && window.parent.location.pathname.startsWith('/teams')) {
      document.documentElement.dataset.host = 'teams'
      return true
    }
  } catch {
    // cadre d'un autre site : ce n'est pas la démo
  }
  return false
}

export const inDemoTeams = detectDemoHost()

/**
 * Démo : ouvrir le site (adresse « / ») mène au faux Teams, d'où l'on lance Trajectoires.
 * Les autres adresses (/connexion, /equipes…) restent accessibles directement.
 */
export function startOnDemoTeams() {
  if (window.self === window.top && window.location.pathname === '/') {
    window.history.replaceState(null, '', '/teams')
  }
}
