import { forwardRef, type SelectHTMLAttributes } from 'react'
import { useController, type Control, type FieldPath, type FieldValues } from 'react-hook-form'

export interface SelectOption {
  value: string | number
  label: string
  disabled?: boolean
}

interface RHFSelectProps<T extends FieldValues> extends Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  'name'
> {
  name: FieldPath<T>
  control: Control<T>
  label?: string
  helperText?: string
  options: SelectOption[]
  placeholder?: string
}

function RHFSelectInner<T extends FieldValues>(
  {
    name,
    control,
    label,
    helperText,
    options,
    placeholder,
    className = '',
    id,
    ...props
  }: RHFSelectProps<T>,
  ref: React.ForwardedRef<HTMLSelectElement>
) {
  const {
    field,
    fieldState: { error },
  } = useController({ name, control })

  const inputId = id || name

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          {...field}
          ref={ref}
          id={inputId}
          className={`
            w-full px-4 py-2 pr-10 rounded-lg border transition-colors duration-200
            appearance-none bg-white cursor-pointer
            focus:outline-none focus:ring-2 focus:ring-offset-0
            ${
              error
                ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-200'
            }
            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
            ${className}
          `}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
        {/* Custom dropdown arrow */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <svg
            className="h-5 w-5 text-gray-400"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error.message}</p>}
      {helperText && !error && <p className="mt-1 text-sm text-gray-500">{helperText}</p>}
    </div>
  )
}

export const RHFSelect = forwardRef(RHFSelectInner) as (<T extends FieldValues>(
  props: RHFSelectProps<T> & { ref?: React.ForwardedRef<HTMLSelectElement> }
) => React.ReactElement) & { displayName?: string }

RHFSelect.displayName = 'RHFSelect'
