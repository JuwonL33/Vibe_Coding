/**
 * 폼 전체에 대한 에러(예: 서버 응답 에러)를 상단에 보여주는 배너.
 * role="alert"로 스크린 리더가 즉시 읽어 주고, E2E 테스트는 .error-message 로 찾는다.
 */
export function FormAlert({ message }: { message?: string }) {
  if (!message) return null
  return (
    <div
      role="alert"
      className="error-message rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
    >
      {message}
    </div>
  )
}
