// 폼 검증 규칙. 백엔드(Zod 스키마)와 같은 기준을 사용한다.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const MIN_PASSWORD_LENGTH = 8

/** 에러 메시지를 반환하고, 문제가 없으면 undefined */
export function validateEmail(email: string): string | undefined {
  if (!email) return '이메일을 입력해 주세요.'
  if (!EMAIL_PATTERN.test(email)) return '올바른 이메일 형식이 아닙니다.'
}

export function validatePassword(password: string): string | undefined {
  if (!password) return '비밀번호를 입력해 주세요.'
  if (password.length < MIN_PASSWORD_LENGTH)
    return `비밀번호는 ${MIN_PASSWORD_LENGTH}자 이상이어야 합니다.`
}

/** undefined 값을 뺀 에러 객체를 만든다. 비어 있으면 검증 통과. */
export function compactErrors<K extends string>(
  errors: Record<K, string | undefined>,
): Partial<Record<K, string>> {
  return Object.fromEntries(
    Object.entries(errors).filter(([, v]) => v !== undefined),
  ) as Partial<Record<K, string>>
}
