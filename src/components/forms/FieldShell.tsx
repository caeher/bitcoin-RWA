import * as React from 'react';
import { cn } from '@lib/utils';
import { fieldLabelClassName, fieldMessageClassName } from './fieldStyles';

export interface FieldShellProps {
  children: React.ReactNode;
  label?: React.ReactNode;
  htmlFor?: string;
  error?: React.ReactNode;
  helperText?: React.ReactNode;
  className?: string;
  labelClassName?: string;
  messageClassName?: string;
}

export function FieldShell({
  children,
  label,
  htmlFor,
  error,
  helperText,
  className,
  labelClassName,
  messageClassName,
}: FieldShellProps) {
  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label htmlFor={htmlFor} className={cn(fieldLabelClassName, labelClassName)}>
          {label}
        </label>
      )}
      {children}
      {error && <p className={cn(fieldMessageClassName, 'text-accent-red', messageClassName)}>{error}</p>}
      {helperText && !error && (
        <p className={cn(fieldMessageClassName, 'text-foreground-secondary', messageClassName)}>{helperText}</p>
      )}
    </div>
  );
}