import { ButtonHTMLAttributes, ReactNode } from 'react';
import type { ThemeVariant, Size } from '@/Styles/style';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ThemeVariant;
    size?: Size;
    children?: ReactNode;
}

const baseStyles =
    'inline-flex items-center justify-center rounded-md border border-transparent font-semibold uppercase tracking-[0.09em] cursor-pointer select-none relative gap-2 transition-all duration-150 focus:outline-none';

const variantStyles: Record<string, string> = {
    primary: 'bg-primary text-white focus-visible:outline-primary',
    secondary:
        'bg-white border-slate-200 text-slate-900 shadow-sm hover:bg-slate-50 hover:border-slate-300 active:bg-slate-100 focus-visible:outline-primary',
    danger: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700 focus-visible:outline-red-500',
    success:
        'bg-emerald-500 text-white hover:bg-emerald-600 active:bg-emerald-700 focus-visible:outline-emerald-500',
};

const sizeStyles: Record<string, string> = {
    sm: 'px-3 py-1.5 text-[0.7rem] leading-4',
    md: 'px-4 py-2 text-xs leading-5',
    lg: 'px-6 py-3 text-sm leading-6',
};

export default function Button({
    variant = 'primary',
    size = 'md',
    className = '',
    children,
    type = 'button',
    ...rest
}: ButtonProps) {
    const variantKey = variant === 'accept' ? 'success' : variant;
    const variantClass = variantStyles[variantKey] ?? variantStyles.primary;
    const sizeClass = sizeStyles[size] ?? sizeStyles.md;

    return (
        <button
            type={type}
            className={`${baseStyles} ${variantClass} ${sizeClass} ${className}`.trim()}
            {...rest}
        >
            <span>{children}</span>
        </button>
    );
}
