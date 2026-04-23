import * as React from 'react';
import { InputField, type InputFieldProps } from './InputField';
import type { SelectFieldOption } from './SelectField';

export interface ComboboxFieldProps extends Omit<InputFieldProps, 'type'> {
  options: SelectFieldOption[];
  type?: 'text' | 'search';
}

export const ComboboxField = React.forwardRef<HTMLInputElement, ComboboxFieldProps>(
  ({ id, options, type = 'text', ...props }, ref) => {
    const inputId = id || React.useId();
    const listId = `${inputId}-list`;

    return (
      <>
        <InputField ref={ref} id={inputId} type={type} list={listId} {...props} />
        <datalist id={listId}>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {typeof option.label === 'string' ? option.label : option.value}
            </option>
          ))}
        </datalist>
      </>
    );
  }
);

ComboboxField.displayName = 'ComboboxField';