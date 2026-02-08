import { forwardRef, type InputHTMLAttributes } from 'react'
import { useController, type Control, type FieldPath, type FieldValues } from 'react-hook-form'

interface RHFCheckboxProps<T extends FieldValues> extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'name' | 'type'
> {
  name: FieldPath<T>
  control: Control<T>
  label?: string
  helperText?: string
}

function RHFCheckboxInner<T extends FieldValues>(
  { name, control, label, helperText, className = '', id, ...props }: RHFCheckboxProps<T>,
  ref: React.ForwardedRef<HTMLInputElement>
) {
  const {
    field: { value, onChange, ...fieldRest },
    fieldState: { error },
  } = useController({ name, control })

  const inputId = id || name

  return (
    <div className="w-full">
      <div className="flex items-center gap-3">
        <input
          {...fieldRest}
          ref={ref}
          type="checkbox"
          id={inputId}
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
          className={`
            h-5 w-5 rounded border-gray-300 text-indigo-600 
            focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0
            transition-colors duration-200 cursor-pointer
            disabled:cursor-not-allowed disabled:opacity-50
            ${error ? 'border-red-300' : 'border-gray-300'}
            ${className}
          `}
          {...props}
        />
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-gray-700 cursor-pointer select-none"
          >
            {label}
          </label>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error.message}</p>}
      {helperText && !error && <p className="mt-1 text-sm text-gray-500">{helperText}</p>}
    </div>
  )
}

export const RHFCheckbox = forwardRef(RHFCheckboxInner) as (<T extends FieldValues>(
  props: RHFCheckboxProps<T> & { ref?: React.ForwardedRef<HTMLInputElement> }
) => React.ReactElement) & { displayName?: string }

RHFCheckbox.displayName = 'RHFCheckbox'
