import * as React from 'react';
import { cn } from '@lib/utils';
import { FieldShell } from './FieldShell';

export interface RadioFieldOption {
  label: React.ReactNode;
  value: string;
  description?: React.ReactNode;
  disabled?: boolean;
}

export interface RadioFieldProps {
  name: string;
  label?: React.ReactNode;
  error?: React.ReactNode;
  helperText?: React.ReactNode;
  options: RadioFieldOption[];
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  containerClassName?: string;
  labelClassName?: string;
  messageClassName?: string;
  optionClassName?: string;
  orientation?: 'vertical' | 'horizontal';
  disabled?: boolean;
}

export function RadioField({
  name,
  label,
  error,
  helperText,
  options,
  value,
  onChange,
  containerClassName,
  labelClassName,
  messageClassName,
  optionClassName,
  orientation = 'vertical',
  disabled,
}: RadioFieldProps) {
  return (
    <FieldShell
      label={label}
      error={error}
      helperText={helperText}
      className={containerClassName}
      labelClassName={labelClassName}
      messageClassName={messageClassName}
    >
      <div className={cn('flex gap-3', orientation === 'vertical' && 'flex-col')}>
        {options.map((option) => {
          const optionDisabled = disabled || option.disabled;

          return (
            <label
              key={option.value}
              className={cn(
                'flex items-start gap-3 rounded-lg border border-border px-3 py-2',
                optionDisabled && 'cursor-not-allowed opacity-50',
                optionClassName
              )}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={value === option.value}
                onChange={onChange}
                disabled={optionDisabled}
                className="mt-1 h-4 w-4 border-border bg-background-elevated text-accent-bitcoin focus:ring-accent-bitcoin/50"
              />
              <span className="space-y-1">
                <span className="block text-sm text-foreground">{option.label}</span>
                {option.description && <span className="block text-sm text-foreground-secondary">{option.description}</span>}
              </span>
            </label>
          );
        })}
      </div>
    </FieldShell>
  );
}