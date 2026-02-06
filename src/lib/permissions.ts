import type { User, UserRole } from '@/types'

export const Permission = {
  MANAGE_USERS: 'MANAGE_USERS',
  CRUD_CATEGORIES: 'CRUD_CATEGORIES',
  CRUD_EXAMS: 'CRUD_EXAMS',
  TAKE_EXAMS: 'TAKE_EXAMS',
  VIEW_ALL: 'VIEW_ALL',
} as const

export type Permission = (typeof Permission)[keyof typeof Permission]

export const hasPermission = (
  user: User | null | undefined,
  permission: Permission,
  rolePermissions?: Record<UserRole, Permission[]>
): boolean => {
  if (!user) return false
  const permissions = rolePermissions ? rolePermissions[user.role] : []
  return permissions.includes(permission)
}

export const hasRole = (user: User | null | undefined, roles: UserRole | UserRole[]): boolean => {
  if (!user) return false
  const allowedRoles = Array.isArray(roles) ? roles : [roles]
  return allowedRoles.includes(user.role)
}
