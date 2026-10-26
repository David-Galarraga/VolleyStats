import React from 'react';
import type { Typography, ThemeVariant } from '@/Styles/style';

export interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
    variant?: Typography;
    color?: ThemeVariant;
    children: React.ReactNode;
}

const baseStyles = 'font-sans m-0 p-0';

const typographyStyles: Record<string, string> = {
    h1: 'text-4xl leading-10 text-slate-900 font-extrabold',
    h2: 'text-3xl leading-9 text-slate-900 font-bold',
    h3: 'text-2xl leading-8 text-slate-900 font-semibold',
    h4: 'text-xl leading-7 text-slate-500 font-semibold',
    h5: 'text-lg leading-7 text-slate-500 font-medium',
    h6: 'text-base leading-6 text-slate-500 font-medium',
    p: 'text-base leading-6 text-slate-900',
    span: 'text-base leading-6 text-slate-500',
    label: 'text-sm font-medium text-slate-900',
    small: 'text-xs text-slate-500',
};

const colorStyles: Record<string, string> = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    danger: 'text-danger',
    success: 'text-success',
};

export default function Text({
    variant = 'p',
    color,
    className = '',
    children,
    ...rest
}: TextProps) {
    const typographyClass = typographyStyles[variant] ?? typographyStyles.p;
    const colorClass = color ? (colorStyles[color] ?? '') : '';
    const classes =
        `${baseStyles} ${typographyClass} ${colorClass} ${className}`.trim();
    const Component = (variant as React.ElementType) || 'p';

    return (
        <Component className={classes} {...rest}>
            {children}
        </Component>
    );
}
