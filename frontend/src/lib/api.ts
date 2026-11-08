import type { Task, TaskStatus } from '../types/task'

/** 백엔드의 통일된 에러 응답 { error, details? } 을 담는 예외 */
export class ApiError extends Error {
  readonly status: number
  readonly details?: unknown

  constructor(status: number, message: string, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

/** 서버에 닿지 못한 경우(네트워크 오류, 서버 꺼짐) */
export class NetworkError extends Error {
  constructor() {
    super('서버에 연결할 수 없습니다.')
    this.name = 'NetworkError'
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  body?: unknown
  token?: string | null
}

// 개발/E2E에서는 Vite dev 서버가 /api 를 백엔드로 프록시한다(vite.config.ts).
async function request<T>(path: string, { method = 'GET', body, token }: RequestOptions = {}): Promise<T> {
  const headers = new Headers()
  if (body !== undefined) headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)

  let res: Response
  try {
    res = await fetch(`/api${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new NetworkError()
  }

  if (res.status === 204) return undefined as T

  const data: unknown = await res.json().catch(() => undefined)
  if (!res.ok) {
    const err = (data ?? {}) as { error?: string; details?: unknown }
    throw new ApiError(res.status, err.error ?? `Request failed (${res.status})`, err.details)
  }
  return data as T
}

export type AuthUser = { id: string; email: string; createdAt: string }
export type AuthResponse = { token: string; user: AuthUser }
export type Credentials = { email: string; password: string }

export const authApi = {
  login: (body: Credentials) => request<AuthResponse>('/auth/login', { method: 'POST', body }),
  register: (body: Credentials) => request<AuthResponse>('/auth/register', { method: 'POST', body }),
}

export const tasksApi = {
  list: (token: string) => request<Task[]>('/tasks', { token }),
  create: (token: string, body: { title: string; description?: string }) =>
    request<Task>('/tasks', { method: 'POST', body, token }),
  update: (token: string, id: string, body: Partial<Pick<Task, 'title' | 'description' | 'status'>>) =>
    request<Task>(`/tasks/${id}`, { method: 'PATCH', body, token }),
  setStatus: (token: string, id: string, status: TaskStatus) =>
    request<Task>(`/tasks/${id}`, { method: 'PATCH', body: { status }, token }),
  remove: (token: string, id: string) => request<void>(`/tasks/${id}`, { method: 'DELETE', token }),
}

/**
 * 에러를 화면에 보여줄 한국어 메시지로 바꾼다.
 * messages에 상태 코드별 문구를 넘기면 그 문구를 우선 사용한다.
 */
export function toErrorMessage(err: unknown, messages: Partial<Record<number, string>> = {}): string {
  if (err instanceof NetworkError) return err.message
  if (err instanceof ApiError) {
    return messages[err.status] ?? '요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.'
  }
  return '알 수 없는 오류가 발생했습니다.'
}
