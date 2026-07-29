import { useEffect } from 'react'
import { Settings2, KeyRound, Mail, Chrome, MessageCircle } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { useAuthConfigs, useToggleAuthMethod } from '@/features/settings'
import type { AuthConfig } from '@/features/settings'

/**
 * Method display metadata — icons, labels, descriptions
 */
const METHOD_META: Record<
  string,
  { icon: React.ReactNode; label: string; description: string; color: string }
> = {
  password: {
    icon: <KeyRound className="size-5" />,
    label: 'Email & Password',
    description: 'Traditional login with email and hashed password. Includes lockout protection.',
    color: 'bg-blue-100 text-blue-600',
  },
  otp: {
    icon: <Mail className="size-5" />,
    label: 'OTP / Magic Link',
    description: 'Passwordless login via one-time code sent to email.',
    color: 'bg-emerald-100 text-emerald-600',
  },
  social_google: {
    icon: <Chrome className="size-5" />,
    label: 'Google',
    description: 'OAuth2 login with Google accounts. Requires client ID configuration.',
    color: 'bg-red-100 text-red-600',
  },
  social_facebook: {
    icon: <MessageCircle className="size-5" />,
    label: 'Facebook',
    description: 'OAuth2 login with Facebook. Requires app ID from Meta Developer Portal.',
    color: 'bg-blue-100 text-blue-700',
  },
  social_x: {
    icon: <XIcon />,
    label: 'X (Twitter)',
    description: 'OAuth2 with PKCE for X/Twitter login. Requires API keys from X Developer Portal.',
    color: 'bg-gray-100 text-gray-800',
  },
}

function XIcon() {
  return (
    <svg className="size-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

export const FeatureConfigPage = () => {
  const { data: configs, isLoading, error } = useAuthConfigs()
  const toggleMutation = useToggleAuthMethod()

  useEffect(() => {
    document.title = 'Feature Configuration | Review Certs'
  }, [])

  const handleToggle = (method: string) => {
    toggleMutation.mutate(method)
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 font-medium">Failed to load configurations</p>
          <p className="text-gray-500 text-sm mt-1">
            {error instanceof Error ? error.message : 'An unexpected error occurred'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-indigo-100 rounded-lg">
          <Settings2 className="w-6 h-6 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Feature Configuration</h1>
          <p className="text-gray-600 mt-0.5">Manage authentication methods and system features</p>
        </div>
      </div>

      {/* Auth Methods Section */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Authentication Methods</h2>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-20 bg-white rounded-xl border border-gray-200 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {configs?.map((config) => (
              <AuthMethodCard
                key={config.id}
                config={config}
                onToggle={handleToggle}
                isToggling={
                  toggleMutation.isPending && toggleMutation.variables === config.auth_method
                }
              />
            ))}
          </div>
        )}
      </section>

      {/* Info Banner */}
      <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
        <h3 className="text-sm font-semibold text-amber-800">How Feature Flags Work</h3>
        <p className="text-sm text-amber-700 mt-1">
          When a method is disabled, the login endpoint returns a 403 error and the frontend hides
          the corresponding login option. Changes take effect within 60 seconds due to caching.
        </p>
      </div>
    </div>
  )
}

// ─── Auth Method Card ────────────────────────────────────────────────────────

interface AuthMethodCardProps {
  config: AuthConfig
  onToggle: (method: string) => void
  isToggling: boolean
}

function AuthMethodCard({ config, onToggle, isToggling }: AuthMethodCardProps) {
  const meta = METHOD_META[config.auth_method] || {
    icon: <Settings2 className="size-5" />,
    label: config.auth_method,
    description: 'Custom authentication method',
    color: 'bg-gray-100 text-gray-600',
  }

  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 shadow-xs hover:shadow-sm transition-shadow">
      {/* Icon */}
      <div className={`p-2.5 rounded-lg ${meta.color}`}>{meta.icon}</div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-gray-900">{meta.label}</h3>
          <Badge variant={config.enabled ? 'default' : 'secondary'} className="text-xs">
            {config.enabled ? 'Active' : 'Disabled'}
          </Badge>
        </div>
        <p className="text-sm text-gray-500 mt-0.5 truncate">{meta.description}</p>
      </div>

      {/* Toggle */}
      <Switch
        checked={config.enabled}
        onCheckedChange={() => onToggle(config.auth_method)}
        disabled={isToggling}
        aria-label={`Toggle ${meta.label}`}
      />
    </div>
  )
}
