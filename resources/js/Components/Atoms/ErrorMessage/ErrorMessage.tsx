import type { MessageVariant } from '@/Styles/style';

interface ErrorMessageProps {
    message: string;
    variant?: MessageVariant;
}

const variantStyles: Record<string, string> = {
    error: 'bg-[#f8d7da] text-[#721c24] border-[#f5c6cb]',
    warning: 'bg-[#fff3cd] text-[#856404] border-[#ffeeba]',
    info: 'bg-[#d1ecf1] text-[#0c5460] border-[#bee5eb]',
};

export default function ErrorMessage({ message, variant = 'error' }: ErrorMessageProps) {
    const variantClass = variantStyles[variant] ?? '';

    return (
        <div className={`rounded border border-transparent p-4 ${variantClass}`}>
            <p className="m-0 font-bold">{message}</p>
        </div>
    );
}
