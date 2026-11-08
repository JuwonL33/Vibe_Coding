import { nextStatus, type Task, type TaskStatus } from '../types/task'

type TaskTableProps = {
  tasks: Task[]
  onStatusChange: (id: string, status: TaskStatus) => void
  onDelete: (id: string) => void
}

const STATUS_BADGE: Record<TaskStatus, string> = {
  pending: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  completed: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
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
    // 좁은 화면에서는 표만 가로 스크롤
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
            <tr key={task.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-medium text-gray-900">{task.title}</td>
              <td className="px-4 py-3 text-gray-600">{task.description ?? '—'}</td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${STATUS_BADGE[task.status]}`}
                >
                  {task.status}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    title={`${nextStatus(task.status)}(으)로 변경`}
                    onClick={() => onStatusChange(task.id, nextStatus(task.status))}
                    className="rounded-md px-2.5 py-1.5 text-xs font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-200 transition hover:bg-indigo-50"
                  >
                    상태 변경
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(task.id)}
                    className="rounded-md px-2.5 py-1.5 text-xs font-semibold text-red-700 ring-1 ring-inset ring-red-200 transition hover:bg-red-50"
                  >
                    삭제
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
