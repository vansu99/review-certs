import { forwardRef, type InputHTMLAttributes } from 'react'
import { useController, type Control, type FieldPath, type FieldValues } from 'react-hook-form'

interface RHFDatepickerProps<T extends FieldValues> extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'name' | 'type'
> {
  name: FieldPath<T>
  control: Control<T>
  label?: string
  helperText?: string
  minDate?: string
  maxDate?: string
}

function RHFDatepickerInner<T extends FieldValues>(
  {
    name,
    control,
    label,
    helperText,
    minDate,
    maxDate,
    className = '',
    id,
    ...props
  }: RHFDatepickerProps<T>,
  ref: React.ForwardedRef<HTMLInputElement>
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
        <input
          {...field}
          ref={ref}
          type="date"
          id={inputId}
          min={minDate}
          max={maxDate}
          className={`
            w-full px-4 py-2 rounded-lg border transition-colors duration-200
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
        />
        {/* Calendar icon */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <svg
            className="h-5 w-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error.message}</p>}
      {helperText && !error && <p className="mt-1 text-sm text-gray-500">{helperText}</p>}
    </div>
  )
}

export const RHFDatepicker = forwardRef(RHFDatepickerInner) as (<T extends FieldValues>(
  props: RHFDatepickerProps<T> & { ref?: React.ForwardedRef<HTMLInputElement> }
) => React.ReactElement) & { displayName?: string }

RHFDatepicker.displayName = 'RHFDatepicker'
