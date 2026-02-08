import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore, authService } from '@/features/auth'
import { UserCircleIcon } from '@heroicons/react/24/solid'
import { RHFInput, RHFRadio, RHFSelect } from '@/components/ui/form'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui'

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

export const ProfilePage = () => {
  const setUser = useAuthStore((state) => state.setUser)
  const queryClient = useQueryClient()

  // Fetch profile from API
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: authService.getProfile,
  })

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

  // Update form when profile data loads
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

  // Update profile mutation
  const updateMutation = useMutation({
    mutationFn: authService.updateProfile,
    onSuccess: (updatedUser) => {
      setUser(updatedUser)
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      toast.success('Updated successfully')
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
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin size-8 text-indigo-600" />
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex">
          {/* Left Sidebar - Avatar Section */}
          <div className="w-64 p-8 border-r border-gray-100 flex flex-col items-center">
            <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center mb-4">
              <UserCircleIcon className="w-28 h-28 text-gray-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">{displayName}</h2>
          </div>

          {/* Right Section - Profile Form */}
          <div className="flex-1 p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Profile</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Email - Read only */}
              <div className="max-w-md">
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={profile?.email || ''}
                  disabled
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>

              {/* First Name & Last Name - Two columns */}
              <div className="grid grid-cols-2 gap-6 max-w-2xl">
                <RHFInput name="firstName" control={control} label="First Name *" maxLength={50} />
                <RHFInput name="lastName" control={control} label="Last Name *" maxLength={50} />
              </div>

              {/* Phone & Gender - Two columns */}
              <div className="grid grid-cols-2 gap-6 max-w-2xl">
                <RHFInput name="phone" control={control} label="Phone" type="tel" maxLength={20} />
                <RHFRadio
                  name="gender"
                  control={control}
                  label="Gender"
                  options={GENDER_OPTIONS}
                  direction="horizontal"
                />
              </div>

              {/* Date of Birth & Country - Two columns */}
              <div className="grid grid-cols-2 gap-6 max-w-2xl">
                <RHFInput name="dateOfBirth" control={control} label="Date of Birth" type="date" />
                <RHFSelect
                  name="country"
                  control={control}
                  label="Country"
                  options={COUNTRIES}
                  placeholder="Select country"
                />
              </div>

              {/* Facebook */}
              <div className="max-w-md">
                <RHFInput
                  name="facebook"
                  control={control}
                  label="Facebook"
                  type="url"
                  maxLength={500}
                />
              </div>

              {/* Save Button */}
              <div className="pt-4">
                <Button type="submit" disabled={isSubmitting || updateMutation.isPending}>
                  {(isSubmitting || updateMutation.isPending) && (
                    <Loader2 className="animate-spin size-4" />
                  )}
                  Save
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
