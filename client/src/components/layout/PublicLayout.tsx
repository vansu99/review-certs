import { Outlet } from 'react-router-dom'
import { Header } from './Header'

/**
 * Layout for public pages (blog list, blog detail) that don't require auth.
 * Shows the header with login/user info but no sidebar.
 */
export const PublicLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
