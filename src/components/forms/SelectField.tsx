import * as React from 'react';
import { FieldShell } from './FieldShell';
import { fieldControlClassName } from './fieldStyles';

export interface SelectFieldOption {
  label: React.ReactNode;
  value: string;
  disabled?: boolean;
}

export interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: React.ReactNode;
  error?: React.ReactNode;
  helperText?: React.ReactNode;
  options?: SelectFieldOption[];
  placeholder?: string;
  containerClassName?: string;
  labelClassName?: string;
  messageClassName?: string;
}

export const SelectField = React.forwardRef<HTMLSelectElement, SelectFieldProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      options,
      placeholder,
      children,
      id,
      containerClassName,
      labelClassName,
      messageClassName,
      ...props
    },
    ref
  ) => {
    const selectId = id || React.useId();

    return (
      <FieldShell
        label={label}
        htmlFor={selectId}
        error={error}
        helperText={helperText}
        className={containerClassName}
        labelClassName={labelClassName}
        messageClassName={messageClassName}
      >
        <select
          id={selectId}
          ref={ref}
          className={fieldControlClassName(
            error && 'border-accent-red focus-visible:ring-accent-red/50',
            className
          )}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options?.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
          {children}
        </select>
      </FieldShell>
    );
  }
);

SelectField.displayName = 'SelectField';