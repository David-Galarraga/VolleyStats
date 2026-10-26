import type { Size } from '@/Styles/style';

export interface SpinnerProps {
    size?: Size;
    label?: string;
}

const sizeStyles: Record<string, string> = {
    sm: 'h-5 w-5 border-2',
    md: 'h-10 w-10 border-[3px]',
    lg: 'h-16 w-16 border-4',
};

export default function Spinner({ size = 'md', label = 'Cargando...' }: SpinnerProps) {
    const sizeClass = sizeStyles[size] ?? sizeStyles.md;

    return (
        <div
            className={`inline-block animate-spin rounded-full border-solid border-primary/15 border-t-primary align-middle ${sizeClass}`}
            role="status"
            aria-label={label}
        >
            <span className="sr-only">{label}</span>
        </div>
    );
}
