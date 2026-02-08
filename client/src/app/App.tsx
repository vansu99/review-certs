import { RouterProvider } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'
import { router } from './router'
import { ErrorBoundary, GlobalErrorFallback } from '@/components/common'
import { Toaster } from '@/components/ui/sonner'

function App() {
  return (
    <ErrorBoundary
      fallback={({ error, resetErrorBoundary }) => (
        <GlobalErrorFallback error={error} resetErrorBoundary={resetErrorBoundary} />
      )}
      onReset={() => queryClient.clear()}
    >
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster richColors position="top-right" />
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

export default App
