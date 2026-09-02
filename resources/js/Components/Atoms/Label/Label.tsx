import React from 'react';
import styles from './Label.module.scss';

interface LabelProps {
    text: string;
    onClick?: () => void;
    htmlFor?: string;
    className?: string;
}

export const Label: React.FC<LabelProps> = ({
    text,
    onClick,
    htmlFor,
    className = ''
}) => {
    const isClickable = !!onClick;

    const labelClasses = [
        styles.label,
        isClickable ? styles.clickable : '',
        className
    ].filter(Boolean).join(' ');

    return (
        <label
            htmlFor={htmlFor}
            className={labelClasses}
            onClick={onClick}
            onKeyDown={(e) => {
                if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    onClick();
                }
            }}
        >
            {text}
        </label>
    );
};