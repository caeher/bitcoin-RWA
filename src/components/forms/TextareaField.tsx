import * as React from 'react';
import { FieldShell } from './FieldShell';
import { fieldControlClassName } from './fieldStyles';

export interface TextareaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: React.ReactNode;
  error?: React.ReactNode;
  helperText?: React.ReactNode;
  containerClassName?: string;
  labelClassName?: string;
  messageClassName?: string;
}

export const TextareaField = React.forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
  ({
    className,
    label,
    error,
    helperText,
    id,
    containerClassName,
    labelClassName,
    messageClassName,
    rows = 4,
    ...props
  }, ref) => {
    const textareaId = id || React.useId();

    return (
      <FieldShell
        label={label}
        htmlFor={textareaId}
        error={error}
        helperText={helperText}
        className={containerClassName}
        labelClassName={labelClassName}
        messageClassName={messageClassName}
      >
        <textarea
          id={textareaId}
          ref={ref}
          rows={rows}
          className={fieldControlClassName(
            error && 'border-accent-red focus-visible:ring-accent-red/50',
            'min-h-[96px] resize-y',
            className
          )}
          {...props}
        />
      </FieldShell>
    );
  }
);

TextareaField.displayName = 'TextareaField';