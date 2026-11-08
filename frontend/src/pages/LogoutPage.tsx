import { useEffect } from 'react'
import { Navigate } from 'react-router'
import { useAuth } from '../auth/useAuth'

/**
 * 로그아웃 전용 라우트.
 * 대시보드(RequireAuth 안)에서 바로 토큰을 지우면 RequireAuth가 먼저 /login 으로 보내 버리므로,
 * 보호 영역을 벗어난 이 페이지에서 토큰을 지우고 홈으로 이동한다.
 */
export default function LogoutPage() {
  const { logout } = useAuth()
  useEffect(() => {
    logout()
  }, [logout])
  return <Navigate to="/" replace />
}
