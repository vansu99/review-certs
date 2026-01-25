/**
 * Conditionally join class names
 */
export const cn = (...classes: (string | boolean | undefined | null)[]): string => {
  return classes.filter(Boolean).join(' ')
}

/**
 * Create a variant class name helper
 */
export const createVariants = <T extends Record<string, Record<string, string>>>(variants: T) => {
  return <K extends keyof T>(variant: K, value: keyof T[K]): string => {
    return variants[variant][value]
  }
}
