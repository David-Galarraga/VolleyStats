import { HTMLAttributes, ReactNode } from 'react';
import { ICON_MAP, IconName } from './icons';
import type { Size } from '@/Styles/style';

export interface IconProps extends HTMLAttributes<HTMLSpanElement> {
    name?: IconName;
    children?: ReactNode;
    size?: Size;
    label?: string;
}

const sizeStyles: Record<string, string> = {
    sm: 'h-5 w-5',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
};

export default function Icon({
    name,
    children,
    size = 'md',
    label,
    className = '',
    ...rest
}: IconProps) {
    const isAccessible = !!label;
    const iconContent = name ? ICON_MAP[name] : children;

    return (
        <span
            className={`inline-flex items-center justify-center align-middle text-current [&_svg]:block [&_svg]:h-full [&_svg]:w-full ${
                sizeStyles[size] ?? sizeStyles.md
            } ${className}`.trim()}
            role={isAccessible ? 'img' : undefined}
            aria-label={label}
            aria-hidden={isAccessible ? undefined : true}
            {...rest}
        >
            {iconContent}
        </span>
    );
}

export type { IconName };
