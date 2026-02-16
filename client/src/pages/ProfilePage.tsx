import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore, authService } from '@/features/auth'
import { useHeatmapData, useStreakData } from '@/features/dashboard'
import { UserCircleIcon } from '@heroicons/react/24/solid'
import { RHFInput, RHFRadio, RHFSelect } from '@/components/ui/form'
import { Loader2, Flame, Trophy, Calendar, Zap, Mail } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui'
import { HeatmapCalendar } from '@/components/common/HeatmapCalendar'

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
  gender: z.enum(['male', 'female']).optional(),
  dateOfBirth: z.string().optional(),
  country: z.string().optional(),
  facebook: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
})

type ProfileFormData = z.infer<typeof profileSchema>

const COUNTRIES = [
  { value: 'vn', label: 'Vietnam' },
  { value: 'us', label: 'United States' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'jp', label: 'Japan' },
  { value: 'kr', label: 'South Korea' },
  { value: 'sg', label: 'Singapore' },
]

const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
]

const STREAK_CONFIG = [
  {
    key: 'currentStreak',
    icon: Flame,
    label: 'Current Streak',
    color: 'text-orange-500',
    bg: 'bg-orange-50',
    suffix: 'days',
  },
  {
    key: 'longestStreak',
    icon: Trophy,
    label: 'Best Streak',
    color: 'text-amber-500',
    bg: 'bg-amber-50',
    suffix: 'days',
  },
  {
    key: 'totalActiveDays',
    icon: Calendar,
    label: 'Active Days',
    color: 'text-emerald-500',
    bg: 'bg-emerald-50',
    suffix: '',
  },
  {
    key: 'totalActivities',
    icon: Zap,
    label: 'Activities',
    color: 'text-indigo-500',
    bg: 'bg-indigo-50',
    suffix: '',
  },
] as const

export const ProfilePage = () => {
  const setUser = useAuthStore((state) => state.setUser)
  const queryClient = useQueryClient()

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: authService.getProfile,
  })

  const { data: heatmapData = [], isLoading: heatmapLoading } = useHeatmapData()
  const { data: streakData } = useStreakData()

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      phone: '',
      gender: undefined,
      dateOfBirth: '',
      country: '',
      facebook: '',
    },
  })

  useEffect(() => {
    if (profile) {
      const nameParts = profile.name?.split(' ') || []
      reset({
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        phone: profile.phone || '',
        gender: profile.gender || undefined,
        dateOfBirth: profile.dateOfBirth
          ? new Date(profile.dateOfBirth).toISOString().split('T')[0]
          : '',
        country: profile.country || '',
        facebook: profile.facebook || '',
      })
    }
  }, [profile, reset])

  const updateMutation = useMutation({
    mutationFn: authService.updateProfile,
    onSuccess: (updatedUser) => {
      setUser(updatedUser)
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      toast.success('Profile updated successfully!')
    },
    onError: () => {
      toast.error('Failed to update profile. Please try again.')
    },
  })

  const onSubmit = async (data: ProfileFormData) => {
    await updateMutation.mutateAsync({
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      gender: data.gender,
      dateOfBirth: data.dateOfBirth,
      country: data.country,
      facebook: data.facebook,
    })
  }

  const displayName = profile?.name || 'User'

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin size-8 text-indigo-600" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* ── Profile Header ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Banner */}
        <div className="h-28 bg-gradient-to-r from-indigo-600 to-violet-500" />

        {/* Avatar centered on banner edge */}
        <div className="flex flex-col items-center -mt-14 pb-5">
          <div className="w-24 h-24 rounded-full bg-white p-1 shadow-md ring-4 ring-white">
            <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
              <UserCircleIcon className="w-[72px] h-[72px] text-gray-300" />
            </div>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mt-3">{displayName}</h1>
          <p className="flex items-center gap-1.5 text-sm text-gray-500 mt-0.5">
            <Mail className="w-3.5 h-3.5" />
            {profile?.email}
          </p>
        </div>

        {/* Streak Stats */}
        {streakData && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-gray-100 border-t border-gray-100">
            {STREAK_CONFIG.map((stat) => {
              const Icon = stat.icon
              const value = streakData[stat.key]
              return (
                <div key={stat.key} className="bg-white flex items-center gap-3 px-5 py-4">
                  <div className={`p-2 rounded-lg ${stat.bg}`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-gray-900 leading-tight">
                      {value}
                      {stat.suffix && (
                        <span className="text-[11px] font-normal text-gray-400 ml-1">
                          {stat.suffix}
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500">{stat.label}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Learning Activity ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">📊 Learning Activity</h2>
        <HeatmapCalendar data={heatmapData} isLoading={heatmapLoading} />
      </div>

      {/* ── Personal Information ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-8 pt-7 pb-2">
          <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
          <p className="text-sm text-gray-400 mt-0.5">Manage your account details</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-8 pb-8 pt-4 space-y-5">
          {/* Email — read-only */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">Email</label>
            <input
              type="email"
              value={profile?.email || ''}
              disabled
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50/80 text-gray-400 cursor-not-allowed text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <RHFInput name="firstName" control={control} label="First Name *" maxLength={50} />
            <RHFInput name="lastName" control={control} label="Last Name *" maxLength={50} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <RHFInput name="phone" control={control} label="Phone" type="tel" maxLength={20} />
            <RHFRadio
              name="gender"
              control={control}
              label="Gender"
              options={GENDER_OPTIONS}
              direction="horizontal"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <RHFInput name="dateOfBirth" control={control} label="Date of Birth" type="date" />
            <RHFSelect
              name="country"
              control={control}
              label="Country"
              options={COUNTRIES}
              placeholder="Select country"
            />
          </div>

          <RHFInput name="facebook" control={control} label="Facebook" type="url" maxLength={500} />

          <div className="flex justify-end pt-3 border-t border-gray-100">
            <Button type="submit" disabled={isSubmitting || updateMutation.isPending}>
              {(isSubmitting || updateMutation.isPending) && (
                <Loader2 className="animate-spin size-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
