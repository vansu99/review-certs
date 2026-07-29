import { NavLink } from 'react-router-dom'
import { useCategories } from '@/features/categories'
import {
  Bookmark,
  BarChart2,
  BookOpenCheck,
  ChartBarStacked,
  LayoutDashboard,
  Settings2,
  ShieldCheck,
  Users,
  Rss,
} from 'lucide-react'
import { ROUTES } from '@/constants'
import { usePermissions } from '@/hooks/usePermissions'
import { cn } from '@/utils'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
    isActive ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
  )

export const Sidebar = () => {
  const { data: categories, isLoading } = useCategories()
  const { isAdmin, isSuperAdmin } = usePermissions()

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-full overflow-y-auto p-4 shrink-0">
      {/* Main navigation */}
      <div className="mb-6">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Navigation
        </h2>
        <nav className="space-y-1">
          <NavLink to={ROUTES.DASHBOARD} className={navLinkClass}>
            <LayoutDashboard className="size-5" />
            Dashboard
          </NavLink>
          <NavLink to={ROUTES.REVIEW} className={navLinkClass}>
            <BookOpenCheck className="size-5" />
            Review
          </NavLink>
          <NavLink to={ROUTES.ANALYTICS} className={navLinkClass}>
            <BarChart2 className="size-5" />
            Analytics
          </NavLink>
          <NavLink to={ROUTES.CATEGORIES} className={navLinkClass}>
            <ChartBarStacked className="size-5" />
            All Categories
          </NavLink>
          <NavLink to={ROUTES.BOOKMARKS} className={navLinkClass}>
            <Bookmark className="size-5" />
            Bookmarks
          </NavLink>
          <NavLink to="/groups" className={navLinkClass}>
            <Users className="size-5" />
            Groups
          </NavLink>

          {/* ── Blog (CMS) ── */}
          <NavLink to="/blog/manage" className={navLinkClass}>
            <Rss className="size-5" />
            Blog
          </NavLink>
        </nav>
      </div>

      {/* Admin-only settings */}
      {isAdmin && (
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Settings
          </h2>
          <nav className="space-y-1">
            <NavLink to="/settings/permissions" className={navLinkClass}>
              <ShieldCheck className="size-5" />
              Permissions
            </NavLink>
            {isSuperAdmin && (
              <NavLink to="/settings/features" className={navLinkClass}>
                <Settings2 className="size-5" />
                Features
              </NavLink>
            )}
          </nav>
        </div>
      )}

      {/* Category list */}
      <div>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Categories
        </h2>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <nav className="space-y-1">
            {categories?.map((category) => (
              <NavLink
                key={category.id}
                to={`/categories/${category.id}`}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                    isActive
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )
                }
              >
                <span>{category.icon || '📚'}</span>
                <span className="truncate">{category.name}</span>
              </NavLink>
            ))}
          </nav>
        )}
      </div>
    </aside>
  )
}
