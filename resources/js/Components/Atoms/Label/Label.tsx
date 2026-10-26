import React from 'react';

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
        'font-sans text-base text-[#333333] select-none transition-colors',
        isClickable
            ? 'inline-block cursor-pointer rounded px-2 py-1 hover:bg-[#f0f0f0] hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0066cc]'
            : '',
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
