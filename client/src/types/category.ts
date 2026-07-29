export interface Category {
  id: string
  slug?: string
  name: string
  description: string
  testCount: number
  icon?: string
  provider?: string
  certificationCode?: string
  level?: 'Foundation' | 'Associate' | 'Professional' | 'Specialty'
  version?: string
  status?: 'draft' | 'published' | 'archived'
  displayOrder?: number
  defaultPassingScore?: number
  estimatedHours?: number
  createdAt?: string
  updatedAt?: string
}
