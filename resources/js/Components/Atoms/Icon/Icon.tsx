import React, { HTMLAttributes, ReactNode } from 'react';
import styles from './Icon.module.scss';
import { ICON_MAP, IconName } from './icons';
import type { Size } from '@/Styles/style';

export interface IconProps extends HTMLAttributes<HTMLSpanElement> {
    name?: IconName;
    children?: ReactNode;
    size?: Size;
    label?: string;
}

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
            className={`${styles.icon} ${styles[size] || styles.md} ${className}`.trim()}
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
