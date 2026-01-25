import { useNProgress } from './useNProgress'

export const NProgressProvider = ({ children }: { children: React.ReactNode }) => {
  useNProgress()
  return <>{children}</>
}
