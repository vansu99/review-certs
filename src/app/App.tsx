import { RouterProvider } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'
import { router } from './router'
import { ErrorBoundary, GlobalErrorFallback } from '@/components/common'

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
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

export default App
