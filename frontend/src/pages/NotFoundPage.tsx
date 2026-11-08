import { Link } from 'react-router'

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center gap-4 py-24 text-center">
      <p className="text-5xl font-bold text-gray-300">404</p>
      <p className="text-gray-700">페이지를 찾을 수 없습니다.</p>
      <Link to="/" className="font-semibold text-indigo-600 hover:text-indigo-500">
        홈으로
      </Link>
    </div>
  )
}
