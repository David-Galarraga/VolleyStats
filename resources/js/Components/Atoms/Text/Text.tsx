import React from 'react';
import styles from './Text.module.scss';
import type { Typography, ThemeVariant } from '@/Styles/style';

export interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
    variant?: Typography;
    color?: ThemeVariant;
    children: React.ReactNode;
}

export default function Text({
    variant = 'p',
    color,
    className = '',
    children,
    ...rest
}: TextProps) {
    const typographyClass = `${styles.typography} ${styles[variant]} ${color ? styles[color] : ''} ${className}`.trim();
    const Component = (variant as React.ElementType) || 'p';

    return (
        <Component className={typographyClass} {...rest}>
            {children}
        </Component>
    );
}
