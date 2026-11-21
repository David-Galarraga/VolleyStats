import { ButtonHTMLAttributes } from 'react';
import Button from '@/Components/Atoms/Button/Button';

export default function SecondaryButton({ type = 'button', ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
    return <Button {...props} type={type} variant="secondary" />;
}
