import { useState, type FormEvent } from 'react'
import { FormAlert } from './ui/FormAlert'
import { FormField } from './ui/FormField'
import { compactErrors, validateEmail, validatePassword } from '../lib/validation'

export type LoginCredentials = {
  email: string
  password: string
}

type LoginProps = {
  onLogin: (credentials: LoginCredentials) => void | Promise<void>
  /** 서버에서 받은 에러 등 폼 전체 에러 메시지 */
  error?: string
  /** 요청 중이면 버튼을 비활성화한다. */
  isLoading?: boolean
}

type FieldErrors = Partial<Record<keyof LoginCredentials, string>>

function validate({ email, password }: LoginCredentials): FieldErrors {
  return compactErrors({ email: validateEmail(email), password: validatePassword(password) })
}

export default function Login({ onLogin, error, isLoading = false }: LoginProps) {
  const [values, setValues] = useState<LoginCredentials>({ email: '', password: '' })
  const [errors, setErrors] = useState<FieldErrors>({})

  const handleChange = (field: keyof LoginCredentials) => (value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }))
    // 사용자가 고치기 시작하면 그 필드의 에러만 지운다.
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const credentials = { email: values.email.trim(), password: values.password }
    const nextErrors = validate(credentials)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return
    void onLogin(credentials)
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="mx-auto flex w-full max-w-sm flex-col gap-5 rounded-2xl bg-white p-8 shadow-lg ring-1 ring-gray-100"
    >
      <h1 className="text-2xl font-bold text-gray-900">로그인</h1>

      <FormAlert message={error} />

      <FormField
        label="이메일"
        type="email"
        name="email"
        autoComplete="email"
        placeholder="you@example.com"
        value={values.email}
        onChange={(e) => handleChange('email')(e.target.value)}
        error={errors.email}
        disabled={isLoading}
      />

      <FormField
        label="비밀번호"
        type="password"
        name="password"
        autoComplete="current-password"
        value={values.password}
        onChange={(e) => handleChange('password')(e.target.value)}
        error={errors.password}
        disabled={isLoading}
      />

      <button
        type="submit"
        disabled={isLoading}
        aria-busy={isLoading}
        className="rounded-lg bg-indigo-600 px-4 py-2.5 font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        로그인
      </button>
    </form>
  )
}
