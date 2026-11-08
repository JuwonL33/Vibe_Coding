import { useId, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react'

type FieldBaseProps = {
  label: string
  /** 있으면 에러 상태로 표시하고 메시지를 입력 요소에 aria-describedby로 연결한다. */
  error?: string
}

type FormFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> & FieldBaseProps
type TextAreaFieldProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> & FieldBaseProps

/** input/textarea 공통 스타일. 에러 여부에 따라 테두리 색만 달라진다. */
function controlClassName(error: string | undefined, extra = '') {
  return [
    'w-full rounded-lg border px-3 py-2 text-gray-900 shadow-sm outline-none transition',
    'placeholder:text-gray-400 focus:ring-2 disabled:cursor-not-allowed disabled:bg-gray-100',
    error
      ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
      : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-200',
    extra,
  ].join(' ')
}

/**
 * label + 입력 요소 + 에러 메시지 레이아웃.
 * - label의 htmlFor와 입력 요소의 id를 useId로 자동 연결한다.
 * - 에러 표시(빨간 테두리, aria-invalid, 하단 메시지)를 모든 폼에서 동일하게 유지한다.
 */
function Field({
  label,
  error,
  children,
}: FieldBaseProps & {
  children: (a11y: { id: string; 'aria-invalid': boolean; 'aria-describedby'?: string }) => ReactNode
}) {
  const id = useId()
  const errorId = `${id}-error`
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      {children({
        id,
        'aria-invalid': Boolean(error),
        'aria-describedby': error ? errorId : undefined,
      })}
      {error && <FieldErrorText id={errorId}>{error}</FieldErrorText>}
    </div>
  )
}

export function FormField({ label, error, className, ...inputProps }: FormFieldProps) {
  return (
    <Field label={label} error={error}>
      {(a11y) => <input {...a11y} className={controlClassName(error, className)} {...inputProps} />}
    </Field>
  )
}

export function TextAreaField({ label, error, className, rows = 3, ...props }: TextAreaFieldProps) {
  return (
    <Field label={label} error={error}>
      {(a11y) => (
        <textarea {...a11y} rows={rows} className={controlClassName(error, className)} {...props} />
      )}
    </Field>
  )
}

/** 필드 하단 에러 메시지. 필드 에러는 모두 이 스타일을 사용한다. */
export function FieldErrorText({ id, children }: { id: string; children: string }) {
  return (
    <p id={id} className="text-sm text-red-600">
      {children}
    </p>
  )
}
