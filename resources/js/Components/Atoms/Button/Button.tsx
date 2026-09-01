import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './Button.module.scss';
import type { ThemeVariant, Size } from '@/Styles/style';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ThemeVariant;
    size?: Size;
    children?: ReactNode;
}

export default function Button({
    variant = 'primary',
    size = 'md',
    className = '',
    children,
    type = 'button',
    ...rest
}: ButtonProps) {
    const variantKey = variant === 'accept' ? 'success' : variant;
    const variantClass = styles[variantKey] || styles.primary;
    const sizeClass = styles[size] || styles.md;

    return (
        <button
            type={type}
            className={`${styles.btn} ${variantClass} ${sizeClass} ${className}`}
            {...rest}
        >
            <span className={styles.content}>{children}</span>
        </button>
    );
}
