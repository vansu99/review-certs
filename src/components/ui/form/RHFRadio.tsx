import { forwardRef, type InputHTMLAttributes } from 'react'
import { useController, type Control, type FieldPath, type FieldValues } from 'react-hook-form'

export interface RadioOption {
  value: string | number
  label: string
  disabled?: boolean
}

interface RHFRadioProps<T extends FieldValues> extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'name' | 'type'
> {
  name: FieldPath<T>
  control: Control<T>
  label?: string
  helperText?: string
  options: RadioOption[]
  direction?: 'horizontal' | 'vertical'
}

function RHFRadioInner<T extends FieldValues>(
  {
    name,
    control,
    label,
    helperText,
    options,
    direction = 'vertical',
    className = '',
    ...props
  }: RHFRadioProps<T>,
  ref: React.ForwardedRef<HTMLInputElement>
) {
  const {
    field: { value, onChange, ...fieldRest },
    fieldState: { error },
  } = useController({ name, control })

  return (
    <div className="w-full">
      {label && <p className="block text-sm font-medium text-gray-700 mb-2">{label}</p>}
      <div
        className={`
          flex gap-4
          ${direction === 'vertical' ? 'flex-col' : 'flex-row flex-wrap'}
        `}
      >
        {options.map((option, index) => {
          const inputId = `${name}-${option.value}`
          const isChecked = value === option.value

          return (
            <div key={option.value} className="flex items-center gap-2">
              <input
                {...fieldRest}
                ref={index === 0 ? ref : undefined}
                type="radio"
                id={inputId}
                value={option.value}
                checked={isChecked}
                onChange={() => onChange(option.value)}
                disabled={option.disabled}
                className={`
                  h-5 w-5 border-gray-300 text-indigo-600
                  focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0
                  transition-colors duration-200 cursor-pointer
                  disabled:cursor-not-allowed disabled:opacity-50
                  ${error ? 'border-red-300' : 'border-gray-300'}
                  ${className}
                `}
                {...props}
              />
              <label
                htmlFor={inputId}
                className={`
                  text-sm font-medium cursor-pointer select-none
                  ${option.disabled ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700'}
                `}
              >
                {option.label}
              </label>
            </div>
          )
        })}
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error.message}</p>}
      {helperText && !error && <p className="mt-2 text-sm text-gray-500">{helperText}</p>}
    </div>
  )
}

export const RHFRadio = forwardRef(RHFRadioInner) as (<T extends FieldValues>(
  props: RHFRadioProps<T> & { ref?: React.ForwardedRef<HTMLInputElement> }
) => React.ReactElement) & { displayName?: string }

RHFRadio.displayName = 'RHFRadio'
