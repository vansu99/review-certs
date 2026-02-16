import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'primary'
  loading?: boolean
  icon?: React.ReactNode
}

export const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'primary',
  loading = false,
  icon,
}: ConfirmDialogProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const el = dialogRef.current
    if (!el) return

    if (open && !el.open) {
      el.showModal()
    } else if (!open && el.open) {
      el.close()
    }
  }, [open])

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) {
      onClose()
    }
  }

  // Handle ESC key
  useEffect(() => {
    const el = dialogRef.current
    if (!el) return

    const handleCancel = (e: Event) => {
      e.preventDefault()
      onClose()
    }

    el.addEventListener('cancel', handleCancel)
    return () => el.removeEventListener('cancel', handleCancel)
  }, [onClose])

  const confirmBtnClass =
    variant === 'danger'
      ? 'bg-red-500 hover:bg-red-600 focus:ring-red-200'
      : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-200'

  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      className="backdrop:bg-black/40 backdrop:backdrop-blur-sm bg-transparent p-0 m-auto rounded-2xl outline-none max-w-md w-full open:animate-[dialog-pop_0.2s_ease-out]"
    >
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon */}
        {icon && <div className="flex justify-center mb-4">{icon}</div>}

        {/* Content */}
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
          {description && <p className="text-sm text-gray-500 leading-relaxed">{description}</p>}
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-all focus:ring-2 disabled:opacity-60 ${confirmBtnClass}`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Submitting…
              </span>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </dialog>
  )
}
