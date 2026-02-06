import { Button } from '@/components/ui/button'
import { AlertCircle, RotateCcw } from 'lucide-react'

interface GlobalErrorFallbackProps {
  error: Error
  resetErrorBoundary: () => void
}

export const GlobalErrorFallback = ({ error, resetErrorBoundary }: GlobalErrorFallbackProps) => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gray-50 dark:bg-zinc-950">
      <div className="max-w-md w-full bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-gray-100 dark:border-zinc-800 p-8 text-center animate-in fade-in zoom-in duration-300">
        <div className="size-16 bg-red-50 dark:bg-red-950/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="size-8 text-red-600 dark:text-red-500" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Oops! Đã có lỗi xảy ra
        </h1>
        <p className="text-gray-600 dark:text-zinc-400 mb-6">
          Ứng dụng gặp sự cố bất ngờ. Chúng tôi xin lỗi vì sự bất tiện này.
        </p>

        <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-lg p-4 mb-8 text-left overflow-x-auto">
          <p className="text-xs font-mono text-red-600 dark:text-red-400 break-words">
            {error.message}
          </p>
          {import.meta.env.DEV && (
            <p className="mt-2 text-[10px] font-mono text-gray-400 dark:text-zinc-500 line-clamp-3">
              {error.stack}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <Button onClick={resetErrorBoundary} className="w-full gap-2 h-11" variant="default">
            <RotateCcw className="size-4" />
            Thử tải lại ứng dụng
          </Button>
          <Button
            onClick={() => window.location.reload()}
            className="w-full h-11"
            variant="outline"
          >
            Tải lại toàn bộ trang
          </Button>
        </div>
      </div>
    </div>
  )
}
