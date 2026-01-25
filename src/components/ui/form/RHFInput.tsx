import { forwardRef, type InputHTMLAttributes } from 'react'
import { useController, type Control, type FieldPath, type FieldValues } from 'react-hook-form'

interface RHFInputProps<T extends FieldValues> extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'name'
> {
  name: FieldPath<T>
  control: Control<T>
  label?: string
  helperText?: string
}

function RHFInputInner<T extends FieldValues>(
  { name, control, label, helperText, className = '', id, ...props }: RHFInputProps<T>,
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
      <input
        {...field}
        ref={ref}
        id={inputId}
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
      {error && <p className="mt-1 text-sm text-red-600">{error.message}</p>}
      {helperText && !error && <p className="mt-1 text-sm text-gray-500">{helperText}</p>}
    </div>
  )
}

export const RHFInput = forwardRef(RHFInputInner) as (<T extends FieldValues>(
  props: RHFInputProps<T> & { ref?: React.ForwardedRef<HTMLInputElement> }
) => React.ReactElement) & { displayName?: string }

RHFInput.displayName = 'RHFInput'
