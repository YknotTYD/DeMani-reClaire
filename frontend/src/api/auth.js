import { request } from './client'

export const login = (email, password) => request('/auth/login', { method: 'POST', body: { email, password } })
export const getMe = () => request('/auth/me')
