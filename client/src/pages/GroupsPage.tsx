import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useGroups, useCreateGroup, type Group } from '@/features/groups'
import { Plus, Users, Search, Filter, ArrowRight, MessageSquare, Award } from 'lucide-react'
import { Input } from '@/components/ui/input'

export const GroupsPage = () => {
  const { data: groups, isLoading, error } = useGroups()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredGroups = groups?.filter((g) =>
    g.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 font-medium">Failed to load groups. Please try again.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Study Groups</h1>
          <p className="text-gray-500 mt-2 text-lg">
            Collaborate with others, set shared goals, and track progress together.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-indigo-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-[0_2px_10px_-3px_rgba(79,70,229,0.4)] hover:shadow-[0_4px_12px_-2px_rgba(79,70,229,0.5)] font-semibold shrink-0"
        >
          <Plus className="w-5 h-5" />
          Create New Group
        </button>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{groups?.length || 0}</p>
            <p className="text-sm text-gray-500">Active Groups</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {groups?.reduce((acc, g) => acc + (g.memberCount || 0), 0) || 0}
            </p>
            <p className="text-sm text-gray-500">Total Members</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">Live</p>
            <p className="text-sm text-gray-500">Group Discussions</p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search groups by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-transparent rounded-lg text-[15px] focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all"
          />
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-100 rounded-lg text-gray-600 hover:bg-gray-50 hover:border-gray-200 transition-all text-sm font-semibold shadow-xs">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      {/* Groups List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-64 bg-gray-50 rounded-2xl animate-pulse border border-gray-100"
            />
          ))}
        </div>
      ) : filteredGroups?.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">No groups found</h3>
          <p className="text-gray-500 mt-2">
            Try adjusting your search or create a new group to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups?.map((group) => (
            <GroupCard key={group.id} group={group} />
          ))}
        </div>
      )}

      {isModalOpen && <CreateGroupModal onClose={() => setIsModalOpen(false)} />}
    </div>
  )
}

const GroupCard = ({ group }: { group: Group }) => {
  return (
    <Link
      to={`/groups/${group.id}`}
      className="group bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full shadow-sm"
    >
      <div className="flex justify-between items-start mb-6">
        <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
          <Users className="w-6 h-6" />
        </div>
        <div className="flex -space-x-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-400 overflow-hidden"
            >
              {i === 3 ? (
                <span className="flex items-center justify-center w-full h-full bg-gray-50">
                  +{Math.max(0, group.memberCount - 2)}
                </span>
              ) : (
                <div className="w-full h-full bg-linear-to-br from-gray-100 to-gray-200" />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
            {group.name}
          </h3>
          {group.role === 'Admin' && (
            <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-wider rounded-sm">
              Admin
            </span>
          )}
        </div>
        <p className="text-gray-500 text-[14px] leading-relaxed mb-6 line-clamp-2">
          {group.description || 'No description provided for this group.'}
        </p>
      </div>

      <div className="flex items-center justify-between pt-5 border-t border-gray-50 mt-auto">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-600">
          <Users className="w-4 h-4 text-gray-400" />
          <span>{group.memberCount} members</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm font-bold text-indigo-600">
          View Details
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  )
}

const CreateGroupModal = ({ onClose }: { onClose: () => void }) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const createGroup = useCreateGroup()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createGroup.mutateAsync({ name, description })
      onClose()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="bg-indigo-600 p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
          <div className="relative">
            <h3 className="text-2xl font-bold">Create New Group</h3>
            <p className="text-indigo-100 text-sm mt-1">Start a community for shared learning</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 ml-1">Group Name</label>
            <Input
              autoFocus
              placeholder="e.g. AWS Certification Prep"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="rounded-lg border-gray-200 focus:border-indigo-500 h-12 text-[15px]"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 ml-1">Description</label>
            <textarea
              placeholder="Describe the goals of this group..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-lg p-4 text-[15px] focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all min-h-[120px] resize-none shadow-xs"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3.5 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-all text-sm font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createGroup.isPending}
              className="flex-1 px-4 py-3.5 bg-linear-to-r from-indigo-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:to-indigo-800 disabled:opacity-50 transition-all text-sm font-bold shadow-[0_2px_10px_-3px_rgba(79,70,229,0.4)]"
            >
              {createGroup.isPending ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
