import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Navigate } from 'react-router-dom'
import { useLogin, useAuthStore } from '@/features/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/Input'
import { ROUTES } from '@/constants'
import { AlertCircle, BookOpen, Info } from 'lucide-react'

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
    <div className="min-h-screen flex">
      {/* Left — Branding panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-indigo-600 via-violet-600 to-purple-700 relative overflow-hidden">
        {/* Decorative shapes */}
        <div className="absolute inset-0">
          <div className="absolute -top-16 -left-16 w-80 h-80 rounded-full bg-white/5" />
          <div className="absolute bottom-20 -right-12 w-64 h-64 rounded-full bg-white/5" />
          <div className="absolute top-1/3 left-1/4 w-40 h-40 rounded-full bg-white/5" />
          <div className="absolute bottom-1/4 left-1/2 w-24 h-24 rounded-full bg-white/10" />
        </div>

        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight">ReviewCerts</span>
          </div>

          <h2 className="text-4xl font-bold leading-tight mb-4">
            Master your
            <br />
            certifications
          </h2>
          <p className="text-lg text-indigo-200 leading-relaxed max-w-md">
            Practice with real exam questions, track your progress, and achieve your certification
            goals.
          </p>

          {/* Feature highlights */}
          <div className="mt-12 space-y-4">
            {[
              { emoji: '📝', text: 'Curated exam questions' },
              { emoji: '📊', text: 'Progress tracking & analytics' },
              { emoji: '🎯', text: 'Goal-based learning paths' },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3">
                <span className="text-lg">{item.emoji}</span>
                <span className="text-indigo-100 text-[15px]">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — Login form */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 px-6 py-12">
        <div className="w-full max-w-[400px]">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-indigo-600 to-violet-600 flex items-center justify-center mx-auto mb-3 shadow-lg">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">ReviewCerts</h1>
          </div>

          {/* Form header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 lg:text-[28px]">Welcome back</h1>
            <p className="text-gray-400 text-sm mt-1.5">
              Sign in to continue your learning journey
            </p>
          </div>

          {/* Form card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
                <div className="flex items-center gap-2.5 p-3 bg-red-50 border border-red-200/60 rounded-xl">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <p className="text-sm text-red-600">
                    {error instanceof Error ? error.message : 'Login failed. Please try again.'}
                  </p>
                </div>
              )}

              <Button type="submit" className="w-full" size="lg" disabled={isPending}>
                {isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Signing in…
                  </span>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </div>

          {/* Demo credentials */}
          <div className="mt-5 flex items-start gap-2.5 p-3.5 bg-indigo-50/60 border border-indigo-100 rounded-xl">
            <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
            <div className="text-xs text-indigo-600/80 leading-relaxed">
              <p className="font-semibold text-indigo-700 mb-0.5">Demo credentials</p>
              <p>
                Email: <span className="font-mono">user@example.com</span>
              </p>
              <p>
                Password: <span className="font-mono">password</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
