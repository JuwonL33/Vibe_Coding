import { useState } from 'react'
import Login from '../components/Login'
import { AuthPageFooter } from './AuthPageFooter'

export default function LoginPage() {
  const [error, setError] = useState<string>()

  return (
    <div className="flex flex-col gap-6 py-12">
      <Login
        onLogin={() => {
          // TODO(API 연동): POST /api/auth/login 호출 후 토큰 저장
          setError('서버 연동은 아직 구현되지 않았습니다.')
        }}
        error={error}
      />
      <AuthPageFooter question="아직 계정이 없으신가요?" to="/signup" label="회원가입" />
    </div>
  )
}
