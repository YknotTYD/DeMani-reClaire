import { Outlet, useLocation } from 'react-router-dom'
import Ambient from '../branding/Ambient'
import Navbar from './Navbar'

export default function Layout() {
  const { pathname } = useLocation()
  return (
    <div className="app">
      <Ambient />
      <Navbar />
      {/* La clé relance l'animation d'entrée à chaque changement de page */}
      <main className="page" key={pathname}>
        <Outlet />
      </main>
    </div>
  )
}
