import { forwardRef, InputHTMLAttributes } from 'react';
import type { InputVariant } from '@/Styles/style';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    type?: InputVariant;
    hasError?: boolean;
}

const baseInput =
    'w-full rounded-md border bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none shadow-sm transition placeholder:text-slate-500 placeholder:opacity-75 focus:ring-1 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500 disabled:opacity-70';

const normalState = 'border-slate-200 focus:border-primary focus:ring-primary';
const errorState = 'border-red-500 focus:border-red-500 focus:ring-red-500';

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ type = 'text', hasError = false, className = '', ...rest }, ref) => {
        const stateClass = hasError ? errorState : normalState;

        return (
            <input
                ref={ref}
                type={type}
                className={`${baseInput} ${stateClass} ${className}`}
                {...rest}
            />
        );
    }
);

Input.displayName = 'Input';

export default Input;
