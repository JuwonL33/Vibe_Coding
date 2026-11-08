import { createContext } from 'react'
import type { Credentials } from '../lib/api'

export type AuthContextValue = {
  token: string | null
  isAuthenticated: boolean
  login: (credentials: Credentials) => Promise<void>
  register: (data: Credentials) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
