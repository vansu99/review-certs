export type UserRole = 'Super Admin' | 'Admin' | 'Manager' | 'User'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  avatar?: string
  createdAt?: string
  phone?: string
  gender?: 'male' | 'female'
  dateOfBirth?: string
  country?: string
  facebook?: string
  xp?: number
  level?: number
  current_streak?: number
  longest_streak?: number
}

export interface AuthResponse {
  user: User
  accessToken: string
  refreshToken?: string
}

export interface LoginCredentials {
  email: string
  password: string
}
