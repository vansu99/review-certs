import { useAuthStore } from '@/features/auth'
import { usePermissionStore } from '@/features/auth/store/permissionStore'
import { Permission, hasPermission, hasRole } from '@/lib/permissions'
import type { UserRole } from '@/types'

export const usePermissions = () => {
  const user = useAuthStore((state) => state.user)
  const rolePermissions = usePermissionStore((state) => state.rolePermissions)

  return {
    user,
    role: user?.role,
    hasPermission: (permission: Permission) => hasPermission(user, permission, rolePermissions),
    hasRole: (roles: UserRole | UserRole[]) => hasRole(user, roles),
    isAdmin: user?.role === 'Admin',
    isManager: user?.role === 'Manager',
    isUser: user?.role === 'User',
  }
}
