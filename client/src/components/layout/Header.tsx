import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore, useLogout } from '@/features/auth'
import { ROUTES } from '@/constants'
import { ArrowRightStartOnRectangleIcon } from '@heroicons/react/24/outline'

export const Header = () => {
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const { mutate: logout, isPending } = useLogout()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Get user initials for avatar
  const getInitials = (name?: string) => {
    if (!name) return 'U'
    const parts = name.trim().split(' ')
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }

  // Get first name for greeting
  const getFirstName = (name?: string) => {
    if (!name) return 'User'
    return name.split(' ')[0]
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    setIsDropdownOpen(false)
    logout()
  }

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <Link to={ROUTES.HOME} className="flex items-center gap-2">
          <span className="text-xl font-bold text-indigo-600">ReviewCerts</span>
        </Link>

        <nav className="flex items-center gap-6">
          {isAuthenticated ? (
            <>
              {/* User avatar with dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-10 h-10 outline-none rounded-full bg-gray-700 text-white flex items-center justify-center text-sm font-medium hover:bg-gray-600 transition-colors focus:outline-none"
                >
                  {getInitials(user?.name)}
                </button>

                {/* Dropdown menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        Hi, {getFirstName(user?.name)}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{user?.role}</p>
                    </div>

                    {/* Profile link */}
                    <Link
                      to={ROUTES.PROFILE}
                      onClick={() => setIsDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      My Profile
                    </Link>

                    {/* My Courses link */}
                    <Link
                      to={ROUTES.CATEGORIES}
                      onClick={() => setIsDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      My Courses
                    </Link>

                    {/* My History link */}
                    <Link
                      to={ROUTES.HISTORY}
                      onClick={() => setIsDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      My History
                    </Link>

                    {/* My Goals link */}
                    <Link
                      to={ROUTES.GOALS}
                      onClick={() => setIsDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      My Goals
                    </Link>

                    {/* Logout button */}
                    <button
                      onClick={handleLogout}
                      disabled={isPending}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      <ArrowRightStartOnRectangleIcon className="w-4 h-4" />
                      <span>{isPending ? 'Logging out...' : 'Log out'}</span>
                    </button>
                  </div>
                )}
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
