import styles from './Badge.module.scss';
import type { MessageVariant, Size } from '@/Styles/style';

interface BadgeProps {
    message: string;
    size?: Size;
    variant?: MessageVariant;
}

export default function Badge({
    message,
    variant = 'info',
    size = 'md'
}: BadgeProps) {
    const variantClass = styles[variant];
    const sizeClass = styles[size];
    return (
        <div className={`${sizeClass} ${variantClass}`}>
            <p className={styles.badgeText}>{message}</p>
        </div>
    );
}