import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '../auth/useAuth'
import Login from '../components/Login'
import { toErrorMessage } from '../lib/api'
import { AuthPageFooter } from './AuthPageFooter'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string>()
  const [isLoading, setIsLoading] = useState(false)

  return (
    <div className="flex flex-col gap-6 py-12">
      <Login
        onLogin={async (credentials) => {
          setError(undefined)
          setIsLoading(true)
          try {
            await login(credentials)
            navigate('/dashboard', { replace: true })
          } catch (err) {
            setError(toErrorMessage(err, { 401: '잘못된 이메일 또는 비밀번호 입니다.' }))
            setIsLoading(false)
          }
        }}
        error={error}
        isLoading={isLoading}
      />
      <AuthPageFooter question="아직 계정이 없으신가요?" to="/register" label="회원가입" />
    </div>
  )
}
