import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { configService } from '../services'
import { toast } from 'sonner'

const AUTH_CONFIGS_KEY = ['admin', 'auth-configs']

export const useAuthConfigs = () => {
  return useQuery({
    queryKey: AUTH_CONFIGS_KEY,
    queryFn: configService.getAuthConfigs,
  })
}

export const useToggleAuthMethod = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (method: string) => configService.toggleAuthMethod(method),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: AUTH_CONFIGS_KEY })
      toast.success(
        `${formatMethodName(data.auth_method)} ${data.enabled ? 'enabled' : 'disabled'}`
      )
    },
    onError: () => {
      toast.error('Failed to update auth method')
    },
  })
}

export const useUpdateAuthConfig = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ method, data }: { method: string; data: { config: Record<string, unknown> } }) =>
      configService.updateAuthConfig(method, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AUTH_CONFIGS_KEY })
      toast.success('Configuration updated')
    },
    onError: () => {
      toast.error('Failed to update configuration')
    },
  })
}

function formatMethodName(method: string): string {
  const names: Record<string, string> = {
    password: 'Password Login',
    otp: 'OTP / Magic Link',
    social_google: 'Google Login',
    social_facebook: 'Facebook Login',
    social_x: 'X (Twitter) Login',
    social_apple: 'Apple Login',
  }
  return names[method] || method
}
