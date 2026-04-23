import * as React from 'react';
import { InputField, type InputFieldProps } from '../forms';

export interface InputProps extends InputFieldProps {}

const Input = React.forwardRef<HTMLInputElement, InputProps>((props, ref) => <InputField ref={ref} {...props} />);
Input.displayName = 'Input';

export { Input };
