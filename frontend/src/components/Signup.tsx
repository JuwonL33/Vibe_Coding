import { useState, type FormEvent } from 'react'
import { FormAlert } from './ui/FormAlert'
import { FormField } from './ui/FormField'
import { compactErrors, validateEmail, validatePassword } from '../lib/validation'

export type SignupData = {
  email: string
  password: string
}

type SignupProps = {
  onSignup: (data: SignupData) => void | Promise<void>
  /** 서버에서 받은 에러 등 폼 전체 에러 메시지 */
  error?: string
  isLoading?: boolean
}

type Values = SignupData & { confirmPassword: string }
type FieldErrors = Partial<Record<keyof Values, string>>

function validate({ email, password, confirmPassword }: Values): FieldErrors {
  return compactErrors({
    email: validateEmail(email),
    password: validatePassword(password),
    confirmPassword: !confirmPassword
      ? '비밀번호를 한 번 더 입력해 주세요.'
      : confirmPassword !== password
        ? '비밀번호가 일치하지 않습니다.'
        : undefined,
  })
}

export default function Signup({ onSignup, error, isLoading = false }: SignupProps) {
  const [values, setValues] = useState<Values>({ email: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState<FieldErrors>({})

  const handleChange = (field: keyof Values) => (value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const trimmed = { ...values, email: values.email.trim() }
    const nextErrors = validate(trimmed)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return
    void onSignup({ email: trimmed.email, password: trimmed.password })
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="mx-auto flex w-full max-w-sm flex-col gap-5 rounded-2xl bg-white p-8 shadow-lg ring-1 ring-gray-100"
    >
      <h1 className="text-2xl font-bold text-gray-900">회원가입</h1>

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
        autoComplete="new-password"
        placeholder="8자 이상"
        value={values.password}
        onChange={(e) => handleChange('password')(e.target.value)}
        error={errors.password}
        disabled={isLoading}
      />
      <FormField
        label="비밀번호 확인"
        type="password"
        name="confirmPassword"
        autoComplete="new-password"
        value={values.confirmPassword}
        onChange={(e) => handleChange('confirmPassword')(e.target.value)}
        error={errors.confirmPassword}
        disabled={isLoading}
      />

      <button
        type="submit"
        disabled={isLoading}
        aria-busy={isLoading}
        className="rounded-lg bg-indigo-600 px-4 py-2.5 font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        회원가입
      </button>
    </form>
  )
}
