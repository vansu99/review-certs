import { type InputHTMLAttributes } from 'react'
import { useFormContext, Controller, type FieldPath, type FieldValues } from 'react-hook-form'
import { NumericFormat, type NumericFormatProps } from 'react-number-format'
import './rhf-components.css'

interface RHFNumberInputProps<TFieldValues extends FieldValues = FieldValues> extends Omit<
  NumericFormatProps<InputHTMLAttributes<HTMLInputElement>>,
  'name' | 'value' | 'onValueChange'
> {
  name: FieldPath<TFieldValues>
  label?: string
  helperText?: string
  prefix?: string
  suffix?: string
}

export function RHFNumberInput<TFieldValues extends FieldValues = FieldValues>({
  name,
  label,
  helperText,
  className = '',
  thousandSeparator = ',',
  decimalScale,
  fixedDecimalScale,
  allowNegative = false,
  prefix,
  suffix,
  ...props
}: RHFNumberInputProps<TFieldValues>) {
  const { control } = useFormContext<TFieldValues>()

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, onBlur, value, ref }, fieldState: { error } }) => (
        <div className="rhf-field">
          {label && (
            <label htmlFor={name} className="rhf-label">
              {label}
            </label>
          )}
          <NumericFormat
            {...props}
            getInputRef={ref}
            id={name}
            value={value ?? ''}
            onValueChange={(values) => {
              // Use floatValue for numeric value, fallback to empty string
              onChange(values.floatValue ?? '')
            }}
            onBlur={onBlur}
            thousandSeparator={thousandSeparator}
            decimalScale={decimalScale}
            fixedDecimalScale={fixedDecimalScale}
            allowNegative={allowNegative}
            prefix={prefix}
            suffix={suffix}
            className={`rhf-input ${error ? 'rhf-input-error' : ''} ${className}`}
          />
          {error ? (
            <span className="rhf-error">{error.message}</span>
          ) : helperText ? (
            <span className="rhf-helper">{helperText}</span>
          ) : null}
        </div>
      )}
    />
  )
}

// How to use:

{
  /* <RHFNumberInput 
  name="price" 
  label="Price" 
  prefix="$" 
  thousandSeparator="," 
  decimalScale={2} 
  fixedDecimalScale 
/> */
}
// Hiển thị: $1,234.56
