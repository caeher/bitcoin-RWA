import * as React from 'react';
import { Check, Copy, Eye, EyeOff } from 'lucide-react';
import { cn } from '@lib/utils';
import { FieldShell } from './FieldShell';
import { fieldControlClassName } from './fieldStyles';

export interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
  error?: React.ReactNode;
  helperText?: React.ReactNode;
  rightElement?: React.ReactNode;
  leftElement?: React.ReactNode;
  copyable?: boolean;
  isPassword?: boolean;
  containerClassName?: string;
  labelClassName?: string;
  messageClassName?: string;
}

export const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  (
    {
      className,
      type = 'text',
      label,
      error,
      helperText,
      rightElement,
      leftElement,
      copyable,
      isPassword,
      id,
      value,
      defaultValue,
      containerClassName,
      labelClassName,
      messageClassName,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [copied, setCopied] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement | null>(null);
    const inputId = id || React.useId();
    const inputValue = value !== undefined ? value : defaultValue;
    const hasRightControls = Boolean(rightElement || isPassword || copyable);

    React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    const handleCopy = async () => {
      if (inputValue === undefined || inputValue === null || inputValue === '') {
        return;
      }

      await navigator.clipboard.writeText(String(inputValue));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    };

    const handleDateInputClick = (event: React.MouseEvent<HTMLInputElement>) => {
      props.onClick?.(event);

      if (event.defaultPrevented) {
        return;
      }

      const pickerEnabledTypes = new Set(['date', 'datetime-local', 'time', 'month', 'week']);
      if (
        pickerEnabledTypes.has(type) &&
        !props.disabled &&
        !props.readOnly &&
        inputRef.current &&
        'showPicker' in inputRef.current
      ) {
        inputRef.current.showPicker();
      }
    };

    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
      <FieldShell
        label={label}
        htmlFor={inputId}
        error={error}
        helperText={helperText}
        className={containerClassName}
        labelClassName={labelClassName}
        messageClassName={messageClassName}
      >
        <div className="relative">
          {leftElement && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-secondary">{leftElement}</div>
          )}
          <input
            type={inputType}
            id={inputId}
            className={fieldControlClassName(
              error && 'border-accent-red focus-visible:ring-accent-red/50',
              'file:border-0 file:bg-transparent file:text-sm file:font-medium',
              leftElement && 'pl-10',
              hasRightControls && 'pr-12',
              className
            )}
            ref={inputRef}
            value={value}
            defaultValue={defaultValue}
            onClick={handleDateInputClick}
            {...props}
          />
          {hasRightControls && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {rightElement && <div className="pointer-events-auto text-foreground-secondary">{rightElement}</div>}
              {isPassword && (
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="pointer-events-auto p-1 text-foreground-secondary hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              )}
              {copyable && (
                <button
                  type="button"
                  onClick={handleCopy}
                  className="pointer-events-auto p-1 text-foreground-secondary hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {copied ? <Check size={16} className="text-accent-green" /> : <Copy size={16} />}
                </button>
              )}
            </div>
          )}
        </div>
      </FieldShell>
    );
  }
);

InputField.displayName = 'InputField';