import { ButtonHTMLAttributes } from 'react';
import Button from '@/Components/Atoms/Button/Button';

export default function DangerButton({ type = 'submit', ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
    return <Button {...props} type={type} variant="danger" />;
}
