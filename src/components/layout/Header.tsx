import { Link } from 'react-router-dom'
import { useAuthStore, useLogout } from '@/features/auth'
import { ROUTES } from '@/constants'

export const Header = () => {
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const { mutate: logout, isPending } = useLogout()

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <Link to={ROUTES.HOME} className="flex items-center gap-2">
          <span className="text-2xl">📚</span>
          <span className="text-xl font-bold text-indigo-600">ReviewCerts</span>
        </Link>

        <nav className="flex items-center gap-6">
          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-4 ml-4 pl-4 border-l border-gray-200">
                <span className="text-sm text-gray-700">{user?.name || user?.email}</span>
                <button
                  onClick={() => logout()}
                  disabled={isPending}
                  className="text-sm text-gray-500 hover:text-red-600 transition-colors disabled:opacity-50"
                >
                  {isPending ? 'Logging out...' : 'Logout'}
                </button>
              </div>
            </>
          ) : (
            <Link
              to={ROUTES.LOGIN}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
