import type { MessageVariant, Size } from '@/Styles/style';

interface BadgeProps {
    message: string;
    size?: Size;
    variant?: MessageVariant;
}

const sizeStyles: Record<string, string> = {
    sm: 'px-3 py-1.5 text-base',
    md: 'px-4 py-2 text-5xl',
    lg: 'px-6 py-3 text-[5rem]',
};

const variantStyles: Record<string, string> = {
    error: 'bg-[#f8d7da] text-[#721c24] border-[#f5c6cb]',
    warning: 'bg-[#fff3cd] text-[#856404] border-[#ffeeba]',
    info: 'bg-[#d1ecf1] text-[#0c5460] border-[#bee5eb]',
    success: 'bg-[#c0ffcb] text-[#109610] border-[#bee5eb]',
};

export default function Badge({
    message,
    variant = 'info',
    size = 'md',
}: BadgeProps) {
    const variantClass = variantStyles[variant] ?? variantStyles.info;
    const sizeClass = sizeStyles[size] ?? sizeStyles.md;
    return (
        <div className={`${sizeClass} ${variantClass}`}>
            <p>{message}</p>
        </div>
    );
}
