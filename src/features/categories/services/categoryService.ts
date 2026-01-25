import type { Category } from '@/types'

// Mock delay for simulating API calls
const mockDelay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Mock categories data
const mockCategories: Category[] = [
  {
    id: '1',
    name: 'JavaScript Fundamentals',
    description: 'Core JavaScript concepts including variables, functions, and async programming',
    testCount: 15,
    icon: '📜',
  },
  {
    id: '2',
    name: 'React Essentials',
    description: 'React hooks, components, state management, and best practices',
    testCount: 12,
    icon: '⚛️',
  },
  {
    id: '3',
    name: 'TypeScript Mastery',
    description: 'Type system, generics, utility types, and advanced patterns',
    testCount: 10,
    icon: '🔷',
  },
  {
    id: '4',
    name: 'CSS & Styling',
    description: 'Modern CSS, Flexbox, Grid, animations, and responsive design',
    testCount: 8,
    icon: '🎨',
  },
  {
    id: '5',
    name: 'Node.js Backend',
    description: 'Server-side JavaScript, Express, APIs, and database integration',
    testCount: 11,
    icon: '🟢',
  },
]

export const categoryService = {
  /**
   * Get all categories
   */
  getCategories: async (): Promise<Category[]> => {
    // Mock implementation
    await mockDelay(500)
    return mockCategories

    // Real API call would be:
    // const response = await axiosInstance.get<Category[]>('/categories')
    // return response.data
  },

  /**
   * Get category by ID
   */
  getCategoryById: async (id: string): Promise<Category | undefined> => {
    // Mock implementation
    await mockDelay(300)
    return mockCategories.find((cat) => cat.id === id)

    // Real API call would be:
    // const response = await axiosInstance.get<Category>(`/categories/${id}`)
    // return response.data
  },
}
