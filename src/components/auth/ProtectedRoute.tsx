import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/features/auth'
import { ROUTES } from '@/constants'

export const ProtectedRoute = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }

  return <Outlet />
}
