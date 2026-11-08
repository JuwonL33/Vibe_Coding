import { useEffect, useId, useRef, type ReactNode } from 'react'

type ModalProps = {
  title: string
  onClose: () => void
  children: ReactNode
  /** 확인/경고용이면 alertdialog */
  role?: 'dialog' | 'alertdialog'
}

/**
 * 공통 모달. 열려 있을 때만 렌더링한다(부모가 조건부로 렌더링).
 * - Escape 키와 바깥(배경) 클릭으로 닫힌다.
 * - 열리면 첫 번째 입력/버튼에 포커스, 닫히면 원래 포커스로 돌아간다.
 */
export function Modal({ title, onClose, children, role = 'dialog' }: ModalProps) {
  const titleId = useId()
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    panelRef.current
      ?.querySelector<HTMLElement>('input, textarea, select, button:not([data-autofocus-skip])')
      ?.focus()
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      previous?.focus()
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        ref={panelRef}
        role={role}
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
      >
        <h2 id={titleId} className="mb-4 text-lg font-semibold text-gray-900">
          {title}
        </h2>
        {children}
      </div>
    </div>
  )
}
