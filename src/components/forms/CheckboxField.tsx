import * as React from 'react';
import { cn } from '@lib/utils';
import { FieldShell } from './FieldShell';

export interface CheckboxFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: React.ReactNode;
  helperText?: React.ReactNode;
  containerClassName?: string;
  checkboxClassName?: string;
  labelClassName?: string;
  messageClassName?: string;
  contentClassName?: string;
  card?: boolean;
}

export const CheckboxField = React.forwardRef<HTMLInputElement, CheckboxFieldProps>(
  (
    {
      label,
      description,
      error,
      helperText,
      className,
      id,
      containerClassName,
      checkboxClassName,
      labelClassName,
      messageClassName,
      contentClassName,
      card,
      disabled,
      ...props
    },
    ref
  ) => {
    const checkboxId = id || React.useId();

    return (
      <FieldShell
        error={error}
        helperText={helperText}
        className={containerClassName}
        messageClassName={messageClassName}
      >
        <label
          htmlFor={checkboxId}
          className={cn(
            'flex items-start gap-3 cursor-pointer',
            card && 'rounded-lg border border-border px-3 py-2',
            disabled && 'cursor-not-allowed opacity-50',
            className
          )}
        >
          <input
            id={checkboxId}
            ref={ref}
            type="checkbox"
            disabled={disabled}
            className={cn(
              'mt-1 h-4 w-4 rounded border-border bg-background-elevated text-accent-bitcoin focus:ring-accent-bitcoin/50',
              checkboxClassName
            )}
            {...props}
          />
          <span className={cn('space-y-1', contentClassName)}>
            {label && <span className={cn('block text-sm text-foreground', labelClassName)}>{label}</span>}
            {description && <span className="block text-sm text-foreground-secondary">{description}</span>}
          </span>
        </label>
      </FieldShell>
    );
  }
);

CheckboxField.displayName = 'CheckboxField';