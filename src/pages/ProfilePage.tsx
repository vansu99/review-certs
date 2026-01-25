import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthStore } from '@/features/auth'
import { UserCircleIcon } from '@heroicons/react/24/solid'
import { RHFInput, RHFRadio, RHFSelect } from '@/components/ui/form'
import { Loader2 } from 'lucide-react'

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
  const user = useAuthStore((state) => state.user)

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.name?.split(' ')[0] || '',
      lastName: user?.name?.split(' ').slice(1).join(' ') || '',
      phone: '',
      gender: undefined,
      dateOfBirth: '',
      country: '',
      facebook: '',
    },
  })

  const onSubmit = async (data: ProfileFormData) => {
    console.log('Profile data:', data)
    // TODO: Implement profile update API call
  }

  const displayName = user?.name || 'User'

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
                  value={user?.email || ''}
                  disabled
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>

              {/* First Name & Last Name - Two columns */}
              <div className="grid grid-cols-2 gap-6 max-w-2xl">
                <RHFInput<ProfileFormData>
                  name="firstName"
                  control={control}
                  label="First Name *"
                  placeholder="Su"
                />
                <RHFInput<ProfileFormData>
                  name="lastName"
                  control={control}
                  label="Last Name *"
                  placeholder="Tran"
                />
              </div>

              {/* Phone & Gender - Two columns */}
              <div className="grid grid-cols-2 gap-6 max-w-2xl">
                <RHFInput<ProfileFormData>
                  name="phone"
                  control={control}
                  label="Phone"
                  type="tel"
                  placeholder="Add phone number"
                />
                <RHFRadio<ProfileFormData>
                  name="gender"
                  control={control}
                  label="Gender"
                  options={GENDER_OPTIONS}
                  direction="horizontal"
                />
              </div>

              {/* Date of Birth & Country - Two columns */}
              <div className="grid grid-cols-2 gap-6 max-w-2xl">
                <RHFInput<ProfileFormData>
                  name="dateOfBirth"
                  control={control}
                  label="Date of Birth"
                  type="date"
                />
                <RHFSelect<ProfileFormData>
                  name="country"
                  control={control}
                  label="Country"
                  options={COUNTRIES}
                  placeholder="Select country"
                />
              </div>

              {/* Facebook */}
              <div className="max-w-md">
                <RHFInput<ProfileFormData>
                  name="facebook"
                  control={control}
                  label="Facebook"
                  type="url"
                  placeholder="Add facebook link"
                />
              </div>

              {/* Save Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? <Loader2 className="animate-spin size-4" /> : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
