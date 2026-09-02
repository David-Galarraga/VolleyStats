import styles from './Spinner.module.scss';
import type { Size } from '@/Styles/style';

export interface SpinnerProps {
    size?: Size;
    label?: string;
};

export default function Spinner({ size = 'md', label = 'Cargando...' }: SpinnerProps) {
    const sizeClass = styles[size];

    return (
        <div
            className={`${styles.spinner} ${sizeClass}`}
            role="status"
            aria-label={label}
        >
            <span className={styles.visuallyHidden}>{label}</span>
        </div>
    );
}