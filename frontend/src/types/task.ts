// 백엔드 backend/src/db/schema.ts의 tasks 테이블과 맞춘 타입.
// API 응답에는 userId/createdAt도 오지만 화면에서 필수는 아니므로 선택으로 둔다.
export const TASK_STATUSES = ['pending', 'completed'] as const
export type TaskStatus = (typeof TASK_STATUSES)[number]

export type Task = {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  userId?: string
  createdAt?: string
}

/** 상태 변경 버튼을 눌렀을 때의 다음 상태 (pending ↔ completed 토글) */
export function nextStatus(status: TaskStatus): TaskStatus {
  return status === 'pending' ? 'completed' : 'pending'
}
