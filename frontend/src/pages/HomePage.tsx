import { Link } from 'react-router'

const FEATURES = [
  { title: '빠른 기록', body: '떠오른 할 일을 제목 하나로 바로 추가하세요.' },
  { title: '한눈에 상태 확인', body: '진행 중인 일과 끝낸 일을 표에서 구분해 보여줍니다.' },
  { title: '나만의 목록', body: '로그인한 본인의 태스크만 보이고 수정할 수 있습니다.' },
]

export default function HomePage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center gap-12 py-16 text-center sm:py-24">
      <div className="flex flex-col items-center gap-5">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
          TaskFlow
        </h1>
        <p className="max-w-xl text-lg text-gray-600">
          할 일을 만들고, 완료하고, 정리하세요. 가볍게 쓰는 태스크 관리 서비스입니다.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            to="/register"
            className="rounded-lg bg-indigo-600 px-5 py-2.5 font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            회원가입
          </Link>
          <Link
            to="/login"
            className="rounded-lg bg-white px-5 py-2.5 font-semibold text-gray-900 shadow-sm ring-1 ring-gray-300 transition hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            로그인
          </Link>
        </div>
      </div>

      <ul className="grid w-full gap-4 text-left sm:grid-cols-3">
        {FEATURES.map((f) => (
          <li key={f.title} className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
            <h2 className="font-semibold text-gray-900">{f.title}</h2>
            <p className="mt-1 text-sm text-gray-600">{f.body}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
