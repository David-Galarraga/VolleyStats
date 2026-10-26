import { Size } from '@/Styles/style';

interface AvatarProps {
    src?: string;
    alt: string;
    variant?: Size;
}

const sizeStyles: Record<string, string> = {
    sm: 'h-8 w-8 text-sm',
    md: 'h-14 w-14 text-2xl',
    lg: 'h-24 w-24 text-[40px]',
};

export default function Avatar({ src, alt, variant = 'md' }: AvatarProps) {
    const sizeClass = sizeStyles[variant] ?? sizeStyles.md;

    const initial = alt ? alt.charAt(0).toUpperCase() : '?';

    return (
        <div
            className={`inline-flex items-center justify-center overflow-hidden rounded-full border-2 border-white bg-primary font-extrabold text-white shadow-sm ${sizeClass}`}
        >
            {src ? (
                <img
                    src={src}
                    alt={alt}
                    className="block h-full w-full object-cover"
                />
            ) : (
                <span className="flex h-full w-full items-center justify-center uppercase">
                    {initial}
                </span>
            )}
        </div>
    );
}
