import { ButtonHTMLAttributes, forwardRef, ReactNode } from 'react';
import { Link } from '@inertiajs/react';
import type { ComponentProps } from 'react';
import type { ThemeVariant, Size } from '@/Styles/style';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ThemeVariant;
    size?: Size;
    children?: ReactNode;
}

const baseStyles =
    'inline-flex items-center justify-center rounded-md border border-transparent font-semibold uppercase tracking-[0.09em] cursor-pointer select-none relative gap-2 transition-all duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

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

function buttonClasses(variant: ThemeVariant, size: Size, className: string) {
    const variantKey = variant === 'accept' ? 'success' : variant;
    return `${baseStyles} ${variantStyles[variantKey] ?? variantStyles.primary} ${sizeStyles[size] ?? sizeStyles.md} ${className}`.trim();
}

type ButtonLinkProps = Omit<ComponentProps<typeof Link>, 'size'> & Pick<ButtonProps, 'variant' | 'size'>;

export function ButtonLink({ variant = 'primary', size = 'md', className = '', ...props }: ButtonLinkProps) {
    return <Link {...props} className={buttonClasses(variant, size, className)} />;
}

export default forwardRef<HTMLButtonElement, ButtonProps>(function Button({
    variant = 'primary',
    size = 'md',
    className = '',
    children,
    type = 'button',
    ...rest
}, ref) {
    return (
        <button
            ref={ref}
            type={type}
            className={buttonClasses(variant, size, className)}
            {...rest}
        >
            <span>{children}</span>
        </button>
    );
});
