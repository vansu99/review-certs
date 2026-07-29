import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore, useLogout } from '@/features/auth'
import { ROUTES } from '@/constants'
import { StreakCounter } from '@/features/gamification/components/StreakCounter'
import { LevelBadge } from '@/features/gamification/components/LevelBadge'
import { Bell, Search, LogOut, User, LayoutDashboard, History, Target } from 'lucide-react'

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
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 sm:px-6 h-16 flex items-center transition-all">
      <div className="flex items-center justify-between w-full">
        {/* Left: Brand */}
        <div className="flex items-center gap-6">
          <Link to={ROUTES.HOME} className="flex items-center gap-2.5 group">
            <div className="bg-primary/10 p-1.5 rounded-lg group-hover:bg-primary/20 transition-colors">
              <img src="/logo.png" alt="ReviewCerts" className="size-6 object-contain" />
            </div>
            <span className="font-bold text-lg tracking-tight text-gray-900 hidden sm:block">
              ReviewCerts
            </span>
          </Link>
        </div>

        {/* Center: Global Search (CMS feel) */}
        {isAuthenticated && (
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                className="bg-gray-100/50 border border-transparent text-gray-900 text-sm rounded-lg focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary block w-full pl-10 p-2 transition-all hover:bg-gray-100"
                placeholder="Search across dashboard..."
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-sans font-medium text-gray-400 bg-white border border-gray-200 rounded shadow-sm">
                  ⌘K
                </kbd>
              </div>
            </div>
          </div>
        )}

        {/* Right: User Actions */}
        <nav className="flex items-center gap-3 sm:gap-5">
          {isAuthenticated ? (
            <>
              {/* Gamification */}
              <div className="hidden lg:flex items-center gap-4 border-r border-gray-200 pr-5">
                <StreakCounter />
                <div className="w-32">
                  <LevelBadge />
                </div>
              </div>

              {/* Notifications */}
              <button className="relative p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 block w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
              </button>

              {/* User avatar with dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-9 h-9 outline-none rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold hover:ring-2 hover:ring-primary/30 hover:ring-offset-2 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  {getInitials(user?.name)}
                </button>

                {/* Dropdown menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-50 origin-top-right animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-4 py-2.5 border-b border-gray-100 mb-1">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {user?.name || 'User'}
                      </p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {user?.email || user?.role || 'user@example.com'}
                      </p>
                    </div>

                    <div className="px-1.5 space-y-0.5">
                      <Link
                        to={ROUTES.PROFILE}
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-2.5 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                      >
                        <User className="w-4 h-4 text-gray-500" />
                        My Profile
                      </Link>

                      <Link
                        to={ROUTES.CATEGORIES}
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-2.5 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-gray-500" />
                        My Courses
                      </Link>

                      <Link
                        to={ROUTES.HISTORY}
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-2.5 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                      >
                        <History className="w-4 h-4 text-gray-500" />
                        My History
                      </Link>

                      <Link
                        to={ROUTES.GOALS}
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-2.5 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                      >
                        <Target className="w-4 h-4 text-gray-500" />
                        My Goals
                      </Link>
                    </div>

                    <div className="h-px bg-gray-100 my-1" />

                    <div className="px-1.5">
                      <button
                        onClick={handleLogout}
                        disabled={isPending}
                        className="w-full flex items-center gap-2.5 px-2.5 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>{isPending ? 'Logging out...' : 'Log out'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link
              to={ROUTES.LOGIN}
              className="px-5 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
            >
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
