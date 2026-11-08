import { useId, type InputHTMLAttributes } from 'react'

type FormFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> & {
  label: string
  /** 있으면 에러 상태로 표시하고 메시지를 input에 aria-describedby로 연결한다. */
  error?: string
}

/**
 * label + input + 에러 메시지를 묶은 공통 입력 필드.
 * - label의 htmlFor와 input의 id를 useId로 자동 연결한다.
 * - 에러 표시(빨간 테두리, aria-invalid, 하단 메시지)를 모든 폼에서 동일하게 유지한다.
 */
export function FormField({ label, error, className = '', ...inputProps }: FormFieldProps) {
  const id = useId()
  const errorId = `${id}-error`

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={error ? true : false}
        aria-describedby={error ? errorId : undefined}
        className={[
          'rounded-lg border px-3 py-2 text-gray-900 shadow-sm outline-none transition',
          'placeholder:text-gray-400 focus:ring-2 disabled:cursor-not-allowed disabled:bg-gray-100',
          error
            ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
            : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-200',
          className,
        ].join(' ')}
        {...inputProps}
      />
      {error && <FieldErrorText id={errorId}>{error}</FieldErrorText>}
    </div>
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
