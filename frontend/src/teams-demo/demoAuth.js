import { tokenStore } from '../api/client'
import { login } from '../api/auth'
import { PERSONAS } from './data'

/**
 * Imite la connexion automatique de Teams : la maquette ouvre une session Trajectoires avec le compte
 * de démonstration de la personne affichée. Une vraie application Teams utiliserait le compte professionnel.
 */
export async function signInAs(persona) {
  const { email, password } = PERSONAS[persona]
  const { token } = await login(email, password)
  tokenStore.set(token)
}
