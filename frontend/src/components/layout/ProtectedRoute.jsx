import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import Loader from '../common/Loader'

/** Bloque l'accès si l'utilisateur n'est pas connecté ou n'a pas le bon rôle. */
export default function ProtectedRoute({ role }) {
  const { user, checking } = useAuth()

  if (checking) return <Loader />
  if (!user) return <Navigate to="/connexion" replace />
  if (role && user.role !== role) return <Navigate to="/" replace />
  return <Outlet />
}
