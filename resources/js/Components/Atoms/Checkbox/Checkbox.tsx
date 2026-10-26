import React from 'react';
import type { CheckboxStatus } from '@/Styles/style';

interface CheckboxProps {
    id: string;
    label: string;
    status?: CheckboxStatus;
    onChange?: (newStatus: CheckboxStatus) => void;
}

export default function Checkbox({ id, label, status = 'unmarked', onChange }: CheckboxProps) {
    const isChecked = status === 'marked' || status === 'disabledMarked';
    const isDisabled = status === 'disabledMarked' || status === 'disabledUnmarked';

    const handleNativeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!onChange) return;

        const nextStatus: CheckboxStatus = e.target.checked ? 'marked' : 'unmarked';
        onChange(nextStatus);
    };

    return (
        <label
            htmlFor={id}
            className={`relative inline-flex select-none items-center ${
                isDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
            }`}
        >
            <input
                type="checkbox"
                id={id}
                checked={isChecked}
                disabled={isDisabled}
                onChange={handleNativeChange}
                className="peer sr-only"
            />
            <span
                aria-hidden="true"
                className="h-[18px] w-[18px] rounded border-2 border-slate-400 bg-white transition-all duration-200 peer-checked:border-blue-500 peer-checked:bg-blue-500 peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500 peer-focus-visible:ring-offset-2"
            />
            <svg
                aria-hidden="true"
                className="pointer-events-none absolute left-[5px] top-1/2 h-3 w-3 -translate-y-1/2 text-white opacity-0 transition-opacity duration-200 peer-checked:opacity-100"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
            >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span className="ml-2.5 text-sm text-slate-800">{label}</span>
        </label>
    );
}
