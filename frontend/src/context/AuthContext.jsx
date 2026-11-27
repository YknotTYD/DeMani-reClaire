import { useEffect, useState } from 'react'
import { getMe, login as apiLogin } from '../api/auth'
import { tokenStore } from '../api/client'
import { AuthContext } from './authContextValue'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [checking, setChecking] = useState(Boolean(tokenStore.get()))

  // Au chargement : si un token existe, on récupère l'utilisateur correspondant
  useEffect(() => {
    if (!tokenStore.get()) return
    getMe()
      .then(setUser)
      .catch(() => tokenStore.clear())
      .finally(() => setChecking(false))
  }, [])

  const login = async (email, password) => {
    const { token, user } = await apiLogin(email, password)
    tokenStore.set(token)
    setUser(user)
    return user
  }

  const logout = () => {
    tokenStore.clear()
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, checking, login, logout }}>{children}</AuthContext.Provider>
}
