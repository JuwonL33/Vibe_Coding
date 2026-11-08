import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '../auth/useAuth'
import TaskForm, { type TaskFormData } from '../components/TaskForm'
import TaskTable from '../components/TaskTable'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { FormAlert } from '../components/ui/FormAlert'
import { Modal } from '../components/ui/Modal'
import { ApiError, tasksApi, toErrorMessage } from '../lib/api'
import type { Task, TaskStatus } from '../types/task'

export default function DashboardPage() {
  // RequireAuth 안에서만 렌더링되므로 token은 항상 있다.
  const { token, logout } = useAuth()
  const navigate = useNavigate()
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>()

  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState<string>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null)

  /** 토큰 만료(401)는 로그아웃 처리하고 true, 그 외에는 화면용 메시지를 돌려준다. */
  const describeError = useCallback(
    (err: unknown): string | null => {
      if (err instanceof ApiError && err.status === 401) {
        logout()
        navigate('/login', { replace: true })
        return null
      }
      return toErrorMessage(err, { 404: '태스크를 찾을 수 없습니다.' })
    },
    [logout, navigate],
  )
  const showError = useCallback(
    (err: unknown) => {
      const message = describeError(err)
      if (message) setError(message)
    },
    [describeError],
  )

  useEffect(() => {
    if (!token) return
    let cancelled = false
    tasksApi
      .list(token)
      .then((list) => !cancelled && setTasks(list))
      .catch((err) => !cancelled && showError(err))
      .finally(() => !cancelled && setIsLoading(false))
    return () => {
      cancelled = true
    }
  }, [token, showError])

  const closeCreate = useCallback(() => {
    setIsCreating(false)
    setCreateError(undefined)
  }, [])

  const handleCreate = async (data: TaskFormData) => {
    setIsSubmitting(true)
    setCreateError(undefined)
    try {
      const created = await tasksApi.create(token!, data)
      setTasks((prev) => [created, ...prev])
      closeCreate()
    } catch (err) {
      const message = describeError(err)
      if (message) setCreateError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStatusChange = async (id: string, status: TaskStatus) => {
    setError(undefined)
    try {
      const updated = await tasksApi.setStatus(token!, id, status)
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)))
    } catch (err) {
      showError(err)
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    const { id } = deleteTarget
    setDeleteTarget(null)
    setError(undefined)
    try {
      await tasksApi.remove(token!, id)
      setTasks((prev) => prev.filter((t) => t.id !== id))
    } catch (err) {
      showError(err)
    }
  }

  const closeDelete = useCallback(() => setDeleteTarget(null), [])

  return (
    <div className="flex flex-col gap-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setIsCreating(true)}
            // 목록 로딩 중에 만들면 늦게 도착한 목록 응답이 새 태스크를 덮어쓸 수 있어 로딩 후에 연다.
            disabled={isLoading}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            새 태스크 추가
          </button>
          <button
            type="button"
            onClick={() => navigate('/logout', { replace: true })}
            className="rounded-lg px-3 py-2 text-sm font-semibold text-gray-700 ring-1 ring-gray-300 transition hover:bg-gray-100"
          >
            로그아웃
          </button>
        </div>
      </div>

      <FormAlert message={error} />

      {isLoading ? (
        <p className="text-sm text-gray-500">불러오는 중…</p>
      ) : (
        <TaskTable
          tasks={tasks}
          onStatusChange={handleStatusChange}
          onDelete={(id) => setDeleteTarget(tasks.find((t) => t.id === id) ?? null)}
        />
      )}

      {isCreating && (
        <Modal title="새 태스크" onClose={closeCreate}>
          <TaskForm
            onSubmit={handleCreate}
            onCancel={closeCreate}
            error={createError}
            isSubmitting={isSubmitting}
          />
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="태스크 삭제"
          message={`‘${deleteTarget.title}’ 태스크를 삭제할까요? 삭제하면 되돌릴 수 없습니다.`}
          onConfirm={confirmDelete}
          onCancel={closeDelete}
        />
      )}
    </div>
  )
}
