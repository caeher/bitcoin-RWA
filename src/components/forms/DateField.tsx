import * as React from 'react';
import { InputField, type InputFieldProps } from './InputField';

type DateFieldMode = 'date' | 'datetime-local' | 'time' | 'month' | 'week';

export interface DateFieldProps extends Omit<InputFieldProps, 'type'> {
  mode?: DateFieldMode;
}

export const DateField = React.forwardRef<HTMLInputElement, DateFieldProps>(
  ({ mode = 'date', ...props }, ref) => <InputField ref={ref} type={mode} {...props} />
);

DateField.displayName = 'DateField';