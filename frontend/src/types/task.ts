// 백엔드 backend/src/db/schema.ts의 tasks 테이블과 맞춘 타입.
// API 응답에는 userId/createdAt도 오지만 화면에서 필수는 아니므로 선택으로 둔다.
export const TASK_STATUSES = ['pending', 'in_progress', 'completed'] as const
export type TaskStatus = (typeof TASK_STATUSES)[number]

/** 화면에 보여줄 상태 이름 */
export const STATUS_LABEL: Record<TaskStatus, string> = {
  pending: '대기',
  in_progress: '진행중',
  completed: '완료',
}

export type Task = {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  userId?: string
  createdAt?: string
}
