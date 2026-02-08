import { useCategories, CategoryList } from '@/features/categories'
import { usePermissions } from '@/hooks/usePermissions'
import { Permission } from '@/lib/permissions'

export const CategoryListPage = () => {
  const { data: categories, isLoading, error } = useCategories()
  const { hasPermission } = usePermissions()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load categories. Please try again.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-600 mt-1">Choose a category to start practicing</p>
        </div>
        {hasPermission(Permission.CRUD_CATEGORIES) && (
          <button className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
            Create Category
          </button>
        )}
      </div>

      <CategoryList categories={categories || []} />
    </div>
  )
}
