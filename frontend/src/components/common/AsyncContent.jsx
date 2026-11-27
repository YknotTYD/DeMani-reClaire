import ErrorMessage from './ErrorMessage'
import Loader from './Loader'

/** Affiche le chargement, l'erreur, ou le contenu une fois la donnée disponible. */
export default function AsyncContent({ loading, error, data, children }) {
  if (error) return <ErrorMessage message={error} />
  if (loading && data === null) return <Loader />
  return children(data)
}
