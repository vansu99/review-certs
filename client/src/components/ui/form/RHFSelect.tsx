import { useController, type Control, type FieldPath, type FieldValues } from 'react-hook-form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../select'
import type { SelectHTMLAttributes } from 'react'

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

export function RHFSelect<T extends FieldValues>({
  name,
  control,
  label,
  helperText,
  options,
  placeholder,
  className = '',
  id,
}: RHFSelectProps<T>) {
  const {
    field: { value, onChange },
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
        <Select value={value?.toString() || ''} onValueChange={onChange}>
          <SelectTrigger
            id={inputId}
            className={`
              w-full border-slate-200 bg-transparent rounded-sm h-10 px-4 text-sm text-gray-700
              transition-all duration-200 hover:border-slate-300
              focus:ring-1 focus:ring-slate-400/20 focus:border-slate-400
              ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''}
              ${className}
            `}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value.toString()}
                disabled={option.disabled}
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error.message}</p>}
      {helperText && !error && <p className="mt-1 text-sm text-gray-500">{helperText}</p>}
    </div>
  )
}

RHFSelect.displayName = 'RHFSelect'
