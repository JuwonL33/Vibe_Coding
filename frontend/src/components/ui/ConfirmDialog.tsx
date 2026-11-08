import { Modal } from './Modal'

type ConfirmDialogProps = {
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
  confirmLabel?: string
}

/** 되돌릴 수 없는 작업(삭제 등) 전에 묻는 확인 다이얼로그 */
export function ConfirmDialog({
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = '확인',
}: ConfirmDialogProps) {
  return (
    <Modal title={title} onClose={onCancel} role="alertdialog">
      <p className="text-sm text-gray-600">{message}</p>
      <div className="mt-6 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-gray-300 transition hover:bg-gray-100"
        >
          취소
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-500"
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
