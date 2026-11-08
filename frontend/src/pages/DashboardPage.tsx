import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '../auth/useAuth'
import TaskTable from '../components/TaskTable'
import { FormAlert } from '../components/ui/FormAlert'
import { FormField } from '../components/ui/FormField'
import { ApiError, tasksApi, toErrorMessage } from '../lib/api'
import type { Task, TaskStatus } from '../types/task'

export default function DashboardPage() {
  // RequireAuth 안에서만 렌더링되므로 token은 항상 있다.
  const { token, logout } = useAuth()
  const navigate = useNavigate()
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>()
  const [title, setTitle] = useState('')
  const [titleError, setTitleError] = useState<string>()

  /** 토큰 만료(401)는 로그아웃 처리, 그 외는 화면에 에러 표시 */
  const handleError = useCallback(
    (err: unknown) => {
      if (err instanceof ApiError && err.status === 401) {
        logout()
        navigate('/login', { replace: true })
        return
      }
      setError(toErrorMessage(err, { 404: '태스크를 찾을 수 없습니다.' }))
    },
    [logout, navigate],
  )

  useEffect(() => {
    if (!token) return
    let cancelled = false
    tasksApi
      .list(token)
      .then((list) => !cancelled && setTasks(list))
      .catch((err) => !cancelled && handleError(err))
      .finally(() => !cancelled && setIsLoading(false))
    return () => {
      cancelled = true
    }
  }, [token, handleError])

  const handleCreate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) {
      setTitleError('제목을 입력해 주세요.')
      return
    }
    setError(undefined)
    try {
      const created = await tasksApi.create(token!, { title: trimmed })
      setTasks((prev) => [created, ...prev])
      setTitle('')
    } catch (err) {
      handleError(err)
    }
  }

  const handleStatusChange = async (id: string, status: TaskStatus) => {
    setError(undefined)
    try {
      const updated = await tasksApi.setStatus(token!, id, status)
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)))
    } catch (err) {
      handleError(err)
    }
  }

  const handleDelete = async (id: string) => {
    setError(undefined)
    try {
      await tasksApi.remove(token!, id)
      setTasks((prev) => prev.filter((t) => t.id !== id))
    } catch (err) {
      handleError(err)
    }
  }

  return (
    <div className="flex flex-col gap-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
        <button
          type="button"
          onClick={() => navigate('/logout', { replace: true })}
          className="rounded-lg px-3 py-2 text-sm font-semibold text-gray-700 ring-1 ring-gray-300 transition hover:bg-gray-100"
        >
          로그아웃
        </button>
      </div>

      <form onSubmit={handleCreate} noValidate className="flex flex-wrap items-end gap-3">
        <div className="min-w-0 flex-1">
          <FormField
            label="새 태스크"
            name="title"
            placeholder="할 일을 입력하세요"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              if (titleError) setTitleError(undefined)
            }}
            error={titleError}
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white shadow-sm transition hover:bg-indigo-500"
        >
          추가
        </button>
      </form>

      <FormAlert message={error} />

      {isLoading ? (
        <p className="text-sm text-gray-500">불러오는 중…</p>
      ) : (
        <TaskTable tasks={tasks} onStatusChange={handleStatusChange} onDelete={handleDelete} />
      )}
    </div>
  )
}
