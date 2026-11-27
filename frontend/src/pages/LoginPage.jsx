import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import Ambient from '../components/branding/Ambient'
import Logo from '../components/branding/Logo'
import Wordmark from '../components/branding/Wordmark'
import ErrorMessage from '../components/common/ErrorMessage'
import ThemeToggle from '../components/common/ThemeToggle'
import { useAction } from '../hooks/useAction'
import { useAuth } from '../hooks/useAuth'

export default function LoginPage() {
  const { user, login } = useAuth()
  const { run, error, pending } = useAction()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  if (user) return <Navigate to="/" replace />

  const handleSubmit = (e) => {
    e.preventDefault()
    run(() => login(email, password))
  }

  return (
    <main className="login">
      <Ambient />
      <form className="login__card stacked-form" onSubmit={handleSubmit}>
        <Logo size={120} />
        <h1 className="login__title">
          <Wordmark size={40} />
        </h1>
        <p className="muted">Suivi des parcours collaborateurs</p>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <ErrorMessage message={error} />
        <button type="submit" disabled={pending}>
          Se connecter
        </button>
        <ThemeToggle />
      </form>
      <Link to="/teams" className="login__demo">
        Présentation : voir Trajectoires dans Teams →
      </Link>
    </main>
  )
}
