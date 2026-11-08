import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { authApi } from '../lib/api'
import { AuthContext, type AuthContextValue } from './authContext'

const TOKEN_KEY = 'taskflow.token'

// localStorage는 시크릿 모드 등에서 예외를 던질 수 있으므로 감싼다.
const storage = {
  get: () => {
    try {
      return localStorage.getItem(TOKEN_KEY)
    } catch {
      return null
    }
  },
  set: (token: string | null) => {
    try {
      if (token) localStorage.setItem(TOKEN_KEY, token)
      else localStorage.removeItem(TOKEN_KEY)
    } catch {
      /* 저장 실패 시 메모리 상태만 유지 */
    }
  },
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(storage.get)

  const saveToken = useCallback((next: string | null) => {
    storage.set(next)
    setToken(next)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      isAuthenticated: token !== null,
      login: async (credentials) => saveToken((await authApi.login(credentials)).token),
      register: async (data) => saveToken((await authApi.register(data)).token),
      logout: () => saveToken(null),
    }),
    [token, saveToken],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
