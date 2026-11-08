import { useState } from 'react'
import Signup from '../components/Signup'
import { AuthPageFooter } from './AuthPageFooter'

export default function SignupPage() {
  const [error, setError] = useState<string>()

  return (
    <div className="flex flex-col gap-6 py-12">
      <Signup
        onSignup={() => {
          // TODO(API 연동): POST /api/auth/register 호출 후 토큰 저장
          setError('서버 연동은 아직 구현되지 않았습니다.')
        }}
        error={error}
      />
      <AuthPageFooter question="이미 계정이 있으신가요?" to="/login" label="로그인" />
    </div>
  )
}
