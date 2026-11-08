import { useState, type FormEvent } from 'react'
import { FormAlert } from './ui/FormAlert'
import { FormField, TextAreaField } from './ui/FormField'

export type TaskFormData = { title: string; description?: string }

type TaskFormProps = {
  onSubmit: (data: TaskFormData) => void | Promise<void>
  onCancel: () => void
  error?: string
  isSubmitting?: boolean
}

export default function TaskForm({ onSubmit, onCancel, error, isSubmitting = false }: TaskFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [titleError, setTitleError] = useState<string>()

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      setTitleError('제목을 입력해 주세요.')
      return
    }
    const trimmedDescription = description.trim()
    void onSubmit(
      trimmedDescription
        ? { title: trimmedTitle, description: trimmedDescription }
        : { title: trimmedTitle },
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <FormAlert message={error} />
      <FormField
        label="제목"
        name="taskTitle"
        placeholder="할 일을 입력하세요"
        maxLength={200}
        value={title}
        onChange={(e) => {
          setTitle(e.target.value)
          if (titleError) setTitleError(undefined)
        }}
        error={titleError}
        disabled={isSubmitting}
      />
      <TextAreaField
        label="설명"
        name="taskDescription"
        placeholder="선택 사항"
        maxLength={2000}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        disabled={isSubmitting}
      />
      <div className="mt-2 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-gray-300 transition hover:bg-gray-100"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          추가
        </button>
      </div>
    </form>
  )
}
