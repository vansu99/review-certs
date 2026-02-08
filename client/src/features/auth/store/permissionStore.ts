import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Permission } from '@/lib/permissions'
import type { UserRole } from '@/types'

interface PermissionState {
  rolePermissions: Record<UserRole, Permission[]>
}

interface PermissionActions {
  updatePermission: (role: UserRole, permission: Permission, enabled: boolean) => void
  resetPermissions: () => void
}

const DEFAULT_PERMISSIONS: Record<UserRole, Permission[]> = {
  Admin: [
    Permission.MANAGE_USERS,
    Permission.CRUD_CATEGORIES,
    Permission.CRUD_EXAMS,
    Permission.TAKE_EXAMS,
    Permission.VIEW_ALL,
  ],
  Manager: [Permission.CRUD_CATEGORIES, Permission.CRUD_EXAMS, Permission.TAKE_EXAMS],
  User: [Permission.TAKE_EXAMS],
}

export const usePermissionStore = create<PermissionState & PermissionActions>()(
  persist(
    (set) => ({
      rolePermissions: DEFAULT_PERMISSIONS,

      updatePermission: (role, permission, enabled) => {
        set((state) => {
          const currentPermissions = state.rolePermissions[role] || []
          let newPermissions: Permission[]

          if (enabled) {
            newPermissions = currentPermissions.includes(permission)
              ? currentPermissions
              : [...currentPermissions, permission]
          } else {
            newPermissions = currentPermissions.filter((p) => p !== permission)
          }

          return {
            rolePermissions: {
              ...state.rolePermissions,
              [role]: newPermissions,
            },
          }
        })
      },

      resetPermissions: () => {
        set({ rolePermissions: DEFAULT_PERMISSIONS })
      },
    }),
    {
      name: 'permission-storage',
    }
  )
)
