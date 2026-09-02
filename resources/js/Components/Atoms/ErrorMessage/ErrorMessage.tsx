import styles from './ErrorMessage.module.scss';
import type { MessageVariant } from '@/Styles/style';

interface ErrorMessageProps {
    message: string;
    variant?: MessageVariant;
}

export default function ErrorMessage({ message, variant = 'error' }: ErrorMessageProps) {
    const variantClass = styles[variant];

    return (
        <div className={`${styles.errorContainer} ${variantClass}`}>
            <p className={styles.errorText}>{message}</p>
        </div>
    );
}