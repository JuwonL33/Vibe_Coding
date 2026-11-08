import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '../auth/useAuth'
import Signup from '../components/Signup'
import { toErrorMessage } from '../lib/api'
import { AuthPageFooter } from './AuthPageFooter'

export default function SignupPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string>()
  const [isLoading, setIsLoading] = useState(false)

  return (
    <div className="flex flex-col gap-6 py-12">
      <Signup
        onSignup={async (data) => {
          setError(undefined)
          setIsLoading(true)
          try {
            // 회원가입 응답에 토큰이 포함되므로 바로 로그인 상태가 된다.
            await register(data)
            navigate('/dashboard', { replace: true })
          } catch (err) {
            setError(
              toErrorMessage(err, {
                409: '이미 가입된 이메일입니다.',
                400: '입력값을 다시 확인해 주세요.',
              }),
            )
            setIsLoading(false)
          }
        }}
        error={error}
        isLoading={isLoading}
      />
      <AuthPageFooter question="이미 계정이 있으신가요?" to="/login" label="로그인" />
    </div>
  )
}
