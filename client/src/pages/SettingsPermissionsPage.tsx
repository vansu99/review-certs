import { usePermissionStore } from '@/features/auth/store/permissionStore'
import { Permission } from '@/lib/permissions'
import type { UserRole } from '@/types'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ShieldCheckIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

const ROLES: UserRole[] = ['Admin', 'Manager', 'User']
const PERMISSIONS: Permission[] = [
  Permission.MANAGE_USERS,
  Permission.CRUD_CATEGORIES,
  Permission.CRUD_EXAMS,
  Permission.TAKE_EXAMS,
  Permission.VIEW_ALL,
]

const PERMISSION_LABELS: Record<Permission, string> = {
  [Permission.MANAGE_USERS]: 'Manage Users',
  [Permission.CRUD_CATEGORIES]: 'Manage Categories',
  [Permission.CRUD_EXAMS]: 'Manage Exams',
  [Permission.TAKE_EXAMS]: 'Take Exams',
  [Permission.VIEW_ALL]: 'View All Content',
}

export const SettingsPermissionsPage = () => {
  const { rolePermissions, updatePermission, resetPermissions } = usePermissionStore()

  const handleToggle = (role: UserRole, permission: Permission, checked: boolean) => {
    updatePermission(role, permission, checked)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <ShieldCheckIcon className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Permission Management</h1>
            <p className="text-gray-600 mt-1">Configure what each role can do in the system</p>
          </div>
        </div>

        <button
          onClick={resetPermissions}
          className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <ArrowPathIcon className="w-4 h-4" />
          Reset to Defaults
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50">
              <TableHead className="w-[200px] font-bold text-gray-900">Permission</TableHead>
              {ROLES.map((role) => (
                <TableHead key={role} className="text-center font-bold text-gray-900">
                  {role}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {PERMISSIONS.map((permission) => (
              <TableRow key={permission} className="hover:bg-gray-50/50">
                <TableCell className="font-medium text-gray-700">
                  {PERMISSION_LABELS[permission]}
                  <div className="text-xs text-gray-400 font-normal">{permission}</div>
                </TableCell>
                {ROLES.map((role) => {
                  const isChecked = rolePermissions[role]?.includes(permission)
                  const isRestricted = role === 'Admin' && permission === Permission.MANAGE_USERS

                  return (
                    <TableCell key={`${role}-${permission}`} className="text-center">
                      <div className="flex justify-center">
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={(checked) => handleToggle(role, permission, !!checked)}
                          disabled={isRestricted} // Prevent Admin from losing user management
                        />
                      </div>
                    </TableCell>
                  )
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
        <h3 className="text-sm font-semibold text-amber-800">Note on Security</h3>
        <p className="text-sm text-amber-700 mt-1">
          Changes take effect immediately for all active sessions. Be careful when restricting
          permissions for the Admin role.
        </p>
      </div>
    </div>
  )
}
