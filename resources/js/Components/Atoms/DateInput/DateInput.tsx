import React, { useEffect, useRef, useState } from 'react';
import styles from './DateInput.module.scss';

export interface DateInputProps {
    id?: string;
    value?: string;
    onChange?: (iso: string) => void;
    max?: string;
    required?: boolean;
    placeholder?: string;
    className?: string;
}

function isoToDisplay(iso: string): string {
    if (!iso) return '';
    const parts = iso.split('-');
    if (parts.length !== 3) return '';
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
}

function displayToIso(display: string): string {
    const match = display.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!match) return '';
    const [, day, month, year] = match;
    return `${year}-${month}-${day}`;
}

function maskDateInput(raw: string): string {
    const digits = raw.replace(/\D/g, '').slice(0, 8);
    const day = digits.slice(0, 2);
    const month = digits.slice(2, 4);
    const year = digits.slice(4, 8);

    let out = day;
    if (digits.length >= 3) out += `/${month}`;
    if (digits.length >= 5) out += `/${year}`;
    return out;
}

const DateInput: React.FC<DateInputProps> = ({
    id,
    value = '',
    onChange,
    max,
    required = false,
    placeholder = 'dd/mm/aaaa',
    className = ''
}) => {
    const [text, setText] = useState(() => isoToDisplay(value));
    const [hasError, setHasError] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const lastIsoRef = useRef(value);

    useEffect(() => {
        if (value !== lastIsoRef.current) {
            setText(isoToDisplay(value));
            lastIsoRef.current = value;
        }
    }, [value]);

    const validate = (iso: string) => {
        if (iso && max && iso > max) {
            setHasError(true);
            inputRef.current?.setCustomValidity(
                'La fecha no puede ser posterior a la actual'
            );
        } else {
            setHasError(false);
            inputRef.current?.setCustomValidity('');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const masked = maskDateInput(e.target.value);
        setText(masked);

        const iso = displayToIso(masked);
        lastIsoRef.current = iso;
        validate(iso);
        onChange?.(iso);
    };

    const handleBlur = () => {
        const iso = displayToIso(text);
        validate(iso);
    };

    const errorClass = hasError ? styles.hasError : '';

    return (
        <input
            ref={inputRef}
            id={id}
            type="text"
            inputMode="numeric"
            className={`${styles.input} ${errorClass} ${className}`}
            value={text}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            maxLength={10}
            required={required}
        />
    );
};

export default DateInput;
