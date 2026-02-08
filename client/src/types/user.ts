export type UserRole = 'Admin' | 'Manager' | 'User'

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
