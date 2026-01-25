export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  createdAt?: string
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
