import React, { useEffect, useRef, useState } from 'react';
import styles from './DateInput.module.scss';

export interface DateInputProps {
    id?: string;
    value?: string;
    onChange?: (iso: string) => void;
    min?: string;
    max?: string;
    required?: boolean;
    placeholder?: string;
    className?: string;
}

export function todayIso(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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

export function isValidIsoDate(iso: string): boolean {
    const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return false;

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);

    if (year < 1900 || year > 9999) return false;
    if (month < 1 || month > 12) return false;

    const daysInMonth = new Date(year, month, 0).getDate();
    return day >= 1 && day <= daysInMonth;
}

const DateInput: React.FC<DateInputProps> = ({
    id,
    value = '',
    onChange,
    min,
    max,
    required = false,
    placeholder = 'dd/mm/aaaa',
    className = ''
}) => {
    const [text, setText] = useState(() => isoToDisplay(value));
    const [hasError, setHasError] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const lastIsoRef = useRef(value);

    const validate = (iso: string) => {
        let message = '';

        if (!iso) {
            message = required ? 'La fecha es obligatoria' : '';
        } else if (!isValidIsoDate(iso)) {
            message = 'Ingrese una fecha válida';
        } else if (min && iso < min) {
            message = `La fecha no puede ser anterior a ${isoToDisplay(min)}`;
        } else if (max && iso > max) {
            message = `La fecha no puede ser posterior a ${isoToDisplay(max)}`;
        }

        setHasError(message !== '');
        inputRef.current?.setCustomValidity(message);
    };

    useEffect(() => {
        if (value !== lastIsoRef.current) {
            setText(isoToDisplay(value));
            lastIsoRef.current = value;
        }
        validate(value);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value, min, max, required]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const masked = maskDateInput(e.target.value);
        setText(masked);

        const iso = displayToIso(masked);
        lastIsoRef.current = iso;

        if (masked.length === 0 || masked.length === 10) {
            validate(iso);
        } else {
            setHasError(false);
            inputRef.current?.setCustomValidity('');
        }

        onChange?.(iso);
    };

    const handleBlur = () => {
        validate(displayToIso(text));
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
