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
            w-full px-4 h-10 rounded-sm border bg-transparent transition-all duration-200
            border-slate-200/60 text-sm text-gray-700
            hover:border-slate-300
            focus:outline-none focus:ring-1 focus:ring-slate-400/20 focus:border-slate-400
            ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''}
            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
            ${className}
          `}
          {...props}
        />
        {/* Calendar icon */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <svg
            className="h-4 w-4 text-gray-400/70"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
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
