import { Link } from 'react-router'

/** 로그인 ↔ 회원가입 페이지 하단의 이동 안내 */
export function AuthPageFooter({ question, to, label }: { question: string; to: string; label: string }) {
  return (
    <p className="text-center text-sm text-gray-600">
      {question}{' '}
      <Link to={to} className="font-semibold text-indigo-600 hover:text-indigo-500">
        {label}
      </Link>
    </p>
  )
}
