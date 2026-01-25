import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Navigate } from 'react-router-dom'
import { useLogin, useAuthStore } from '@/features/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/Input'
import { ROUTES } from '@/constants'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginFormData = z.infer<typeof loginSchema>

export const LoginPage = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const { mutate: login, isPending, error } = useLogin()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'user@example.com',
      password: 'password',
    },
  })

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to={ROUTES.CATEGORIES} replace />
  }

  const onSubmit = (data: LoginFormData) => {
    login(data)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-5xl mb-4 block">📚</span>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ReviewCerts</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="Email"
              type="email"
              maxLength={191}
              placeholder="Enter your email"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Password"
              type="password"
              maxLength={50}
              placeholder="Enter your password"
              error={errors.password?.message}
              {...register('password')}
            />

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">
                  {error instanceof Error ? error.message : 'Login failed'}
                </p>
              </div>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={isPending}>
              Sign In
            </Button>
          </form>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 text-center">
              <strong>Demo credentials:</strong>
              <br />
              Email: user@example.com
              <br />
              Password: password
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
