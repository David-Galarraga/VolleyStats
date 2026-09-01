import React, { forwardRef, InputHTMLAttributes } from 'react';
import styles from './Input.module.scss';
import type { InputVariant } from '@/Styles/style';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    type?: InputVariant;
    hasError?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ type = 'text', hasError = false, className = '', ...rest }, ref) => {
        const errorClass = hasError ? styles.hasError : '';

        return (
            <input
                ref={ref}
                type={type}
                className={`${styles.input} ${errorClass} ${className}`}
                {...rest}
            />
        );
    }
);

Input.displayName = 'Input';

export default Input;
