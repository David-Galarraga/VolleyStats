import styles from './Avatar.module.scss';
import { Size } from '@/Styles/style';

interface AvatarProps {
    src?: string;
    alt: string;
    variant?: Size;
}

export default function Avatar({ src, alt, variant = 'md' }: AvatarProps) {
    const sizeClass = styles[variant as keyof typeof styles];

    const initial = alt ? alt.charAt(0).toUpperCase() : '?';

    return (
        <div className={`${styles.avatarContainer} ${sizeClass}`}>
            {src ? (
                <img
                    src={src}
                    alt={alt}
                    className={styles.avatarImage}
                />
            ) : (
                <span className={styles.avatarFallback}>
                    {initial}
                </span>
            )}
        </div>
    );
}