import { useEffect, useRef, useState } from 'react'
import { STATUS_LABEL, TASK_STATUSES, type Task, type TaskStatus } from '../types/task'

type TaskTableProps = {
  tasks: Task[]
  onStatusChange: (id: string, status: TaskStatus) => void
  onDelete: (id: string) => void
}

const STATUS_BADGE: Record<TaskStatus, string> = {
  pending: 'bg-amber-50 text-amber-700 ring-amber-600/20 hover:bg-amber-100',
  in_progress: 'bg-sky-50 text-sky-700 ring-sky-600/20 hover:bg-sky-100',
  completed: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 hover:bg-emerald-100',
}

/** 상태 배지 버튼 + 클릭 시 열리는 상태 선택 메뉴 */
function StatusMenu({ status, onSelect }: { status: TaskStatus; onSelect: (s: TaskStatus) => void }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    const onMouseDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('mousedown', onMouseDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('mousedown', onMouseDown)
    }
  }, [open])

  return (
    <div ref={rootRef} className="relative inline-block">
      <button
        type="button"
        aria-label="상태 변경"
        aria-haspopup="menu"
        aria-expanded={open}
        data-testid={`status-${status}`}
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset transition ${STATUS_BADGE[status]}`}
      >
        {STATUS_LABEL[status]}
        <span aria-hidden="true">▾</span>
      </button>
      {open && (
        <div
          role="menu"
          className="absolute left-0 z-10 mt-1 w-28 overflow-hidden rounded-lg bg-white py-1 shadow-lg ring-1 ring-gray-200"
        >
          {TASK_STATUSES.filter((s) => s !== status).map((s) => (
            <button
              key={s}
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false)
                onSelect(s)
              }}
              className="block w-full px-3 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-100"
            >
              {STATUS_LABEL[s]}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function TaskTable({ tasks, onStatusChange, onDelete }: TaskTableProps) {
  if (tasks.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-gray-300 px-4 py-10 text-center text-sm text-gray-500">
        태스크가 없습니다.
      </p>
    )
  }

  return (
    // 좁은 화면에서는 표만 가로 스크롤. 상태 메뉴가 잘리지 않도록 세로 overflow는 보이게 둔다.
    <div className="overflow-x-auto rounded-xl ring-1 ring-gray-200">
      <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
        <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-600">
          <tr>
            <th scope="col" className="px-4 py-3">제목</th>
            <th scope="col" className="px-4 py-3">설명</th>
            <th scope="col" className="px-4 py-3">상태</th>
            <th scope="col" className="px-4 py-3 text-right">작업</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {tasks.map((task) => (
            <tr key={task.id} className="task-item hover:bg-gray-50">
              <td className="px-4 py-3 font-medium text-gray-900">{task.title}</td>
              <td className="px-4 py-3 text-gray-600">{task.description ?? '—'}</td>
              <td className="px-4 py-3">
                <StatusMenu status={task.status} onSelect={(s) => onStatusChange(task.id, s)} />
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  type="button"
                  data-testid="delete-button"
                  onClick={() => onDelete(task.id)}
                  className="rounded-md px-2.5 py-1.5 text-xs font-semibold text-red-700 ring-1 ring-inset ring-red-200 transition hover:bg-red-50"
                >
                  삭제
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
