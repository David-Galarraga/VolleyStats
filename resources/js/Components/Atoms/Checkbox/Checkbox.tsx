import React from 'react';
import styles from './Checkbox.module.scss';
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
        <div className={`${styles.checkboxWrapper} ${isDisabled ? styles.disabled : ''}`}>
            <input
                type="checkbox"
                id={id}
                checked={isChecked}
                disabled={isDisabled}
                onChange={handleNativeChange}
                className={styles.nativeCheckbox}
            />
            <label htmlFor={id} className={styles.checkboxLabel}>
                {label}
            </label>
        </div>
    );
}