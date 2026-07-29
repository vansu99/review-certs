import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  useGroup,
  useGroupLeaderboard,
  useGroupDiscussions,
  usePostComment,
  useAddMember,
  useAddGroupExams,
  useRemoveGroupExam,
  useResetGroupProgress,
  type GroupDetail,
  type LeaderboardEntry,
  type GroupDiscussion,
} from '@/features/groups'
import { useCategories } from '@/features/categories'
import { useTestsByCategory } from '@/features/tests'
import {
  LayoutDashboard,
  Users,
  Trophy,
  BookOpen,
  MessageSquare,
  Plus,
  Trash2,
  RotateCcw,
  ChevronRight,
  UserPlus,
  CheckCircle2,
  Calendar,
  Send,
  MoreVertical,
} from 'lucide-react'
import { Input } from '@/components/ui/input'

type Tab = 'overview' | 'leaderboard' | 'exams' | 'discussion' | 'members'

export const GroupDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const [activeTab, setActiveTab] = useState<Tab>('overview')

  const { data: group, isLoading, refetch } = useGroup(id!)
  const { data: leaderboard } = useGroupLeaderboard(id!)
  const { data: discussions } = useGroupDiscussions(id!)
  const resetProgress = useResetGroupProgress(id!)

  const isAdmin = group?.userRole === 'Admin'

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-48 bg-gray-50 rounded-2xl border border-gray-100" />
        <div className="h-12 bg-gray-50 rounded-xl border border-gray-100 w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-gray-50 rounded-2xl border border-gray-100" />
          <div className="h-96 bg-gray-50 rounded-2xl border border-gray-100" />
        </div>
      </div>
    )
  }

  if (!group)
    return <div className="text-center py-20 font-bold text-gray-400">Group not found</div>

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'exams', label: 'Mandatory Exams', icon: BookOpen },
    { id: 'discussion', label: 'Discussion', icon: MessageSquare },
    { id: 'members', label: 'Members', icon: Users },
  ]

  return (
    <div className="space-y-6 pb-20">
      {/* Group Header Card */}
      <div className="relative overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm p-8">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-600" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{group.name}</h1>
              <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-widest rounded-md border border-indigo-100">
                {group.userRole}
              </span>
            </div>
            <p className="text-gray-500 text-lg max-w-3xl leading-relaxed">{group.description}</p>
          </div>

          <div className="flex flex-col items-center lg:items-end gap-5 shrink-0">
            {isAdmin && (
              <button
                onClick={() => {
                  if (confirm('Bạn có chắc chắn muốn reset toàn bộ tiến độ của nhóm không?')) {
                    resetProgress.mutate()
                  }
                }}
                disabled={resetProgress.isPending}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-100 transition-all shadow-xs"
              >
                <RotateCcw
                  className={`w-3.5 h-3.5 ${resetProgress.isPending ? 'animate-spin' : ''}`}
                />
                Reset Progress
              </button>
            )}
            <div className="text-right w-full lg:w-72">
              <div className="flex justify-between items-end mb-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Group Completion
                </span>
                <span className="text-sm font-black text-gray-900">{group.progress}%</span>
              </div>
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden p-0.5 border border-gray-50">
                <div
                  className="h-full bg-linear-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-1000 ease-out shadow-xs"
                  style={{ width: `${group.progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex bg-white p-1.5 rounded-lg border border-gray-100 shadow-sm overflow-x-auto no-scrollbar gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2.5 px-6 py-3 text-sm font-bold transition-all rounded-md min-w-max ${
              activeTab === tab.id
                ? 'bg-gray-900 text-white shadow-lg shadow-gray-200'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <tab.icon
              className={`w-4 h-4 ${activeTab === tab.id ? 'text-white' : 'text-gray-400'}`}
            />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {activeTab === 'overview' && <OverviewTab group={group} leaderboard={leaderboard} />}
        {activeTab === 'leaderboard' && <LeaderboardTab leaderboard={leaderboard} />}
        {activeTab === 'exams' && <ExamsTab group={group} isAdmin={isAdmin} />}
        {activeTab === 'discussion' && <DiscussionTab groupId={id!} discussions={discussions} />}
        {activeTab === 'members' && <MembersTab group={group} isAdmin={isAdmin} />}
      </div>
    </div>
  )
}

// --- SUB-COMPONENTS ---

interface OverviewTabProps {
  group: GroupDetail
  leaderboard?: LeaderboardEntry[]
}

const OverviewTab = ({ group, leaderboard }: OverviewTabProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Group Goals</h2>
          </div>

          {group.exams.length === 0 ? (
            <div className="py-12 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
              <p className="text-gray-400 text-sm font-medium">
                Chưa có bài thi bắt buộc nào được thiết lập.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <p className="text-sm text-gray-600 leading-relaxed font-medium">
                Để hoàn thành mục tiêu nhóm, mọi thành viên cần vượt qua các bài thi bắt buộc sau:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {group.exams.map((exam) => (
                  <div
                    key={exam.id}
                    className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl bg-white hover:border-indigo-100 hover:shadow-md transition-all group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-indigo-500 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{exam.title}</p>
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mt-0.5">
                        {exam.categoryName}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                <Trophy className="w-5 h-5" />
              </div>
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest">
                Top Rankings
              </h2>
            </div>
            <Link to="#" className="text-xs font-bold text-indigo-600 hover:underline">
              View All
            </Link>
          </div>
          <div className="space-y-5">
            {leaderboard?.slice(0, 3).map((user, index) => (
              <div key={user.id} className="flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <span
                    className={`text-sm font-black w-6 ${
                      index === 0
                        ? 'text-amber-500'
                        : index === 1
                          ? 'text-gray-400'
                          : 'text-amber-700'
                    }`}
                  >
                    0{index + 1}
                  </span>
                  <div className="size-10 rounded-full border-2 border-white shadow-sm ring-1 ring-gray-100 overflow-hidden bg-gray-50 flex items-center justify-center">
                    {user.avatar ? (
                      <img src={user.avatar} className="size-full object-cover" />
                    ) : (
                      <span className="text-sm font-bold text-gray-400 uppercase">
                        {user.name[0]}
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-bold text-gray-900 truncate max-w-[120px] group-hover:text-indigo-600 transition-colors">
                    {user.name}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-gray-900">{user.totalScore}</p>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">
                    points
                  </p>
                </div>
              </div>
            ))}
            {(!leaderboard || leaderboard.length === 0) && (
              <p className="text-center text-xs text-gray-400 italic py-4">No data available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

interface LeaderboardTabProps {
  leaderboard?: LeaderboardEntry[]
}

const LeaderboardTab = ({ leaderboard }: LeaderboardTabProps) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mt-6">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50/50 border-b border-gray-100">
            <tr>
              <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Rank
              </th>
              <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Member
              </th>
              <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">
                Exams Passed
              </th>
              <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">
                Total Score
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {leaderboard?.map((user, index) => (
              <tr key={user.id} className="group hover:bg-gray-50/50 transition-colors">
                <td className="px-8 py-5">
                  <span
                    className={`text-base font-black ${
                      index === 0
                        ? 'text-amber-500'
                        : index === 1
                          ? 'text-gray-400'
                          : index === 2
                            ? 'text-amber-700'
                            : 'text-gray-300'
                    }`}
                  >
                    #{index + 1}
                  </span>
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className="size-10 rounded-full border-2 border-white shadow-sm ring-1 ring-gray-100 overflow-hidden bg-gray-50 flex items-center justify-center">
                      {user.avatar ? (
                        <img src={user.avatar} className="size-full object-cover" />
                      ) : (
                        <span className="text-sm font-bold text-gray-400 uppercase">
                          {user.name[0]}
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                      {user.name}
                    </span>
                  </div>
                </td>
                <td className="px-8 py-5 text-center">
                  <span className="inline-flex items-center justify-center px-2.5 py-1 bg-gray-100 text-gray-900 text-xs font-bold rounded-lg min-w-8">
                    {user.examsCompleted}
                  </span>
                </td>
                <td className="px-8 py-5 text-right">
                  <div className="flex flex-col items-end">
                    <span className="text-base font-black text-gray-900 group-hover:text-indigo-600 transition-colors">
                      {user.totalScore}
                    </span>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter -mt-1">
                      points
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

interface ExamsTabProps {
  group: GroupDetail
  isAdmin: boolean
}

const ExamsTab = ({ group, isAdmin }: ExamsTabProps) => {
  const [isAdding, setIsAdding] = useState(false)
  const { data: categories } = useCategories()
  const addExams = useAddGroupExams(group.id)
  const removeExam = useRemoveGroupExam(group.id)

  const handleAddExams = async (testIds: string[]) => {
    try {
      await addExams.mutateAsync(testIds)
      setIsAdding(false)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Mandatory Exams</h2>
          <p className="text-sm text-gray-500 mt-1">
            Exams that every member must complete to achieve the goal.
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-indigo-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-[0_2px_10px_-3px_rgba(79,70,229,0.4)] font-bold text-sm"
          >
            <Plus className="w-5 h-5" />
            Add Exams
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {group.exams.map((exam) => (
          <div key={exam.id} className="relative group/card">
            <Link
              to={`/tests/${exam.id}`}
              className="flex flex-col p-6 bg-white border border-gray-100 rounded-2xl hover:border-indigo-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full shadow-sm"
            >
              <div className="flex items-center justify-between mb-6">
                <span
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                    exam.difficulty === 'Beginner'
                      ? 'bg-emerald-50 text-emerald-600'
                      : exam.difficulty === 'Intermediate'
                        ? 'bg-amber-50 text-amber-600'
                        : 'bg-rose-50 text-rose-600'
                  }`}
                >
                  {exam.difficulty}
                </span>
                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover/card:bg-indigo-50 group-hover/card:text-indigo-600 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-[15px] font-extrabold text-gray-900 mb-2 leading-snug group-hover/card:text-indigo-600 transition-colors">
                {exam.title}
              </h3>
              <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mt-auto pt-4">
                {exam.categoryName}
              </p>
            </Link>

            {isAdmin && (
              <button
                onClick={(e) => {
                  e.preventDefault()
                  if (group.progress >= 30) {
                    alert('Chỉ có thể xóa bài thi khi tiến độ nhóm dưới 30%')
                    return
                  }
                  if (confirm('Xóa bài thi này khỏi danh sách bắt buộc?')) {
                    removeExam.mutate(exam.id)
                  }
                }}
                disabled={removeExam.isPending}
                className="absolute -top-2 -right-2 p-2 bg-white border border-gray-100 rounded-full text-gray-400 hover:text-rose-600 hover:border-rose-100 shadow-xl opacity-0 group-hover/card:opacity-100 transition-all z-10 scale-90 group-hover/card:scale-100"
                title={group.progress >= 30 ? 'Không thể xóa khi tiến độ >= 30%' : 'Xóa bài thi'}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      {isAdding && (
        <AddExamsModal
          categories={categories}
          onClose={() => setIsAdding(false)}
          onAdd={handleAddExams}
        />
      )}
    </div>
  )
}

interface DiscussionTabProps {
  groupId: string
  discussions?: GroupDiscussion[]
}

const DiscussionTab = ({ groupId, discussions }: DiscussionTabProps) => {
  const [content, setContent] = useState('')
  const postComment = usePostComment(groupId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return
    try {
      await postComment.mutateAsync({ content })
      setContent('')
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-6">
      {/* Post Box */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg border border-gray-100 shadow-sm p-6 overflow-hidden relative group"
      >
        <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-600" />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Chia sẻ suy nghĩ của bạn với nhóm..."
          className="w-full bg-gray-50 border border-transparent rounded-lg p-4 text-[15px] focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all min-h-[120px] resize-none"
        />
        <div className="flex justify-between items-center mt-4">
          <p className="text-[11px] text-gray-400 font-medium">
            Lưu ý: Bình luận của bạn sẽ được hiển thị công khai cho tất cả thành viên trong nhóm.
          </p>
          <button
            type="submit"
            disabled={postComment.isPending || !content.trim()}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-all text-sm font-bold shadow-lg"
          >
            {postComment.isPending ? 'Posting...' : 'Send Message'}
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>

      {/* Discussion List */}
      <div className="space-y-8">
        {discussions?.length === 0 ? (
          <div className="text-center py-20 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
            <MessageSquare className="w-16 h-16 text-gray-200 mx-auto mb-6 opacity-50" />
            <h3 className="text-lg font-bold text-gray-900">No discussions yet</h3>
            <p className="text-gray-400 text-sm mt-1 font-medium">
              Be the first one to start a conversation!
            </p>
          </div>
        ) : (
          discussions?.map((comment) => (
            <div key={comment.id} className="flex gap-6 group">
              <div className="size-12 shrink-0 rounded-2xl border-2 border-white shadow-md ring-1 ring-gray-100 overflow-hidden bg-gray-50 flex items-center justify-center">
                {comment.userAvatar ? (
                  <img src={comment.userAvatar} className="size-full object-cover" />
                ) : (
                  <span className="text-base font-bold text-gray-400 uppercase">
                    {comment.userName[0]}
                  </span>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-gray-900">{comment.userName}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300" />
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter flex items-center gap-1">
                      <Calendar className="w-2.5 h-2.5" />
                      {new Date(comment.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <button className="text-gray-300 hover:text-gray-900 transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs group-hover:shadow-md group-hover:border-indigo-100 transition-all">
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

interface MembersTabProps {
  group: GroupDetail
  isAdmin: boolean
}

const MembersTab = ({ group, isAdmin }: MembersTabProps) => {
  const [isInviting, setIsInviting] = useState(false)
  const [identifier, setIdentifier] = useState('')
  const addMember = useAddMember(group.id)

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await addMember.mutateAsync(identifier)
      setIdentifier('')
      setIsInviting(false)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Community Members</h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage and view everyone in this study group.
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setIsInviting(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-indigo-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-[0_2px_10px_-3px_rgba(79,70,229,0.4)] font-bold text-sm"
          >
            <UserPlus className="w-5 h-5" />
            Invite Member
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {group.members.map((member) => (
          <div
            key={member.id}
            className="flex items-center gap-5 p-5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-indigo-100 transition-all group"
          >
            <div className="size-14 rounded-2xl border-2 border-white shadow-sm ring-1 ring-gray-100 overflow-hidden bg-gray-50 flex items-center justify-center shrink-0">
              {member.avatar ? (
                <img src={member.avatar} className="size-full object-cover" />
              ) : (
                <span className="text-xl font-bold text-gray-400 uppercase">{member.name[0]}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-bold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                {member.name}
              </p>
              <p className="text-xs text-gray-500 truncate mt-0.5">{member.email}</p>
              <div className="mt-2.5">
                <span
                  className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                    member.role === 'Admin'
                      ? 'bg-indigo-50 text-indigo-600 border-indigo-100'
                      : 'bg-gray-50 text-gray-500 border-gray-100'
                  }`}
                >
                  {member.role}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isInviting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="bg-linear-to-r from-indigo-600 to-violet-600 p-8 text-white relative overflow-hidden text-center">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
              <div className="size-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/30 backdrop-blur-sm">
                <UserPlus className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold">Invite Member</h3>
              <p className="text-indigo-100 text-sm mt-1">Grow your learning community</p>
            </div>
            <form onSubmit={handleInvite} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Email or Username</label>
                <Input
                  autoFocus
                  placeholder="Enter contact identifier"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  className="rounded-lg border-gray-200 focus:border-indigo-500 h-12 text-[15px]"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsInviting(false)}
                  className="flex-1 px-4 py-3.5 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-all text-sm font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addMember.isPending}
                  className="flex-1 px-4 py-3.5 bg-linear-to-r from-indigo-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:to-indigo-800 disabled:opacity-50 transition-all text-sm font-bold shadow-[0_2px_10px_-3px_rgba(79,70,229,0.4)]"
                >
                  {addMember.isPending ? 'Inviting...' : 'Invite Member'}
                </button>
              </div>
              {addMember.isError && (
                <p className="text-xs text-rose-500 font-bold text-center animate-bounce">
                  User not found or already in group.
                </p>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

interface AddExamsModalProps {
  categories?: import('@/types').Category[]
  onClose: () => void
  onAdd: (testIds: string[]) => void
}

const AddExamsModal = ({ categories, onClose, onAdd }: AddExamsModalProps) => {
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedTests, setSelectedTests] = useState<string[]>([])

  const { data: tests, isLoading } = useTestsByCategory(selectedCategory)

  const toggleTest = (id: string) => {
    setSelectedTests((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl h-[640px] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-white relative z-10">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 tracking-tight">Add Mandatory Exams</h3>
            <p className="text-sm text-gray-500 mt-1 font-medium">
              Select exams that all members must complete.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-50 rounded-xl text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Plus className="w-6 h-6 rotate-45" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex bg-gray-50/30">
          {/* Category List */}
          <div className="w-[200px] border-r border-gray-100 overflow-y-auto p-4 space-y-1">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-3 mb-3">
              Categories
            </p>
            {categories?.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setSelectedCategory(c.id)
                  setSelectedTests([])
                }}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all duration-200 flex items-center gap-3 ${
                  selectedCategory === c.id
                    ? 'bg-white border border-gray-100 shadow-md font-bold text-gray-900'
                    : 'text-gray-500 hover:bg-white hover:text-gray-700'
                }`}
              >
                <span className="text-base">{c.icon}</span>
                <span className="truncate">{c.name}</span>
              </button>
            ))}
          </div>

          {/* Test List */}
          <div className="flex-1 overflow-y-auto p-8">
            {!selectedCategory ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm font-medium animate-in fade-in duration-500">
                <div className="size-20 bg-gray-100 rounded-[24px] flex items-center justify-center mb-6 opacity-30">
                  <BookOpen className="w-10 h-10" />
                </div>
                <p>Select a category to view exams</p>
              </div>
            ) : isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="h-16 bg-white border border-gray-100 rounded-2xl animate-pulse"
                  />
                ))}
              </div>
            ) : tests?.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm font-medium italic">
                No exams found in this category
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">
                  Available Exams
                </p>
                {tests?.map((test) => (
                  <label
                    key={test.id}
                    className={`flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition-all group ${
                      selectedTests.includes(test.id)
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100'
                        : 'bg-white border-gray-100 hover:border-indigo-100 text-gray-700 shadow-xs'
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={selectedTests.includes(test.id)}
                      onChange={() => toggleTest(test.id)}
                    />
                    <div
                      className={`size-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                        selectedTests.includes(test.id)
                          ? 'bg-white border-white'
                          : 'border-gray-200 group-hover:border-indigo-200'
                      }`}
                    >
                      {selectedTests.includes(test.id) && (
                        <Plus className="w-4 h-4 text-indigo-600" />
                      )}
                    </div>
                    <span className="text-[15px] font-bold truncate">{test.title}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="p-8 border-t border-gray-100 flex justify-between items-center bg-white">
          <div className="flex flex-col">
            <span className="text-xl font-black text-gray-900">{selectedTests.length}</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Selected Tests
            </span>
          </div>
          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-100 text-gray-600 rounded-lg hover:bg-gray-50 transition-all text-sm font-bold"
            >
              Cancel
            </button>
            <button
              onClick={() => onAdd(selectedTests)}
              disabled={selectedTests.length === 0}
              className="px-8 py-3 bg-linear-to-r from-gray-800 to-gray-900 text-white rounded-lg hover:from-gray-900 hover:to-black disabled:opacity-50 transition-all text-sm font-bold shadow-xl"
            >
              Add to Group
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
