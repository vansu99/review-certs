import { useState } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useCreateGoal } from '@/features/goals'
import { useCategories } from '@/features/categories'
import type { TargetType, PriorityLevel } from '@/types'

interface CreateGoalModalProps {
  isOpen: boolean
  onClose: () => void
}

export const CreateGoalModal = ({ isOpen, onClose }: CreateGoalModalProps) => {
  const { mutate: createGoal, isPending } = useCreateGoal()
  const { data: categories } = useCategories()

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    targetType: 'category' as TargetType,
    categoryId: '',
    examIds: [] as string[],
    passingScore: 70,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    priority: 'medium' as PriorityLevel,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    createGoal(
      {
        name: formData.name,
        description: formData.description || undefined,
        targetType: formData.targetType,
        categoryId: formData.categoryId || undefined,
        examIds: formData.examIds,
        passingScore: formData.passingScore,
        startDate: formData.startDate,
        endDate: formData.endDate,
        priority: formData.priority,
      },
      {
        onSuccess: () => {
          onClose()
          // Reset form
          setFormData({
            name: '',
            description: '',
            targetType: 'category',
            categoryId: '',
            examIds: [],
            passingScore: 70,
            startDate: new Date().toISOString().split('T')[0],
            endDate: '',
            priority: 'medium',
          })
        },
      }
    )
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">🎯 Create New Goal</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Goal Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Goal Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Master AWS Solutions Architect"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your goal..."
              rows={2}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          {/* Target Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Type <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="targetType"
                  value="category"
                  checked={formData.targetType === 'category'}
                  onChange={(e) =>
                    setFormData({ ...formData, targetType: e.target.value as TargetType })
                  }
                  className="w-4 h-4 text-indigo-600"
                />
                <span className="text-sm text-gray-700">Category</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="targetType"
                  value="exams"
                  checked={formData.targetType === 'exams'}
                  onChange={(e) =>
                    setFormData({ ...formData, targetType: e.target.value as TargetType })
                  }
                  className="w-4 h-4 text-indigo-600"
                />
                <span className="text-sm text-gray-700">Specific Exams</span>
              </label>
            </div>
          </div>

          {/* Category Selection */}
          {formData.targetType === 'category' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Category <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Choose a category...</option>
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Passing Score & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Passing Score <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.passingScore}
                onChange={(e) =>
                  setFormData({ ...formData, passingScore: parseInt(e.target.value) })
                }
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value={60}>60%</option>
                <option value={70}>70%</option>
                <option value={80}>80%</option>
                <option value={90}>90%</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.value as PriorityLevel })
                }
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="low">🟢 Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🔴 High</option>
              </select>
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                min={formData.startDate}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Award Info */}
          <div className="p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border border-yellow-200">
            <h4 className="text-sm font-medium text-yellow-800 mb-2">🏆 Award Tiers</h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-yellow-700">
              <span>🥉 Bronze: Avg score 60-79%</span>
              <span>🥈 Silver: Avg score 80-89%</span>
              <span>🥇 Gold: Avg score 90-94%</span>
              <span>💎 Diamond: Avg score ≥95%</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {isPending ? 'Creating...' : 'Create Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
