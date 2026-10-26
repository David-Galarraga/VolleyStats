import { ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Icon from '../Icon/Icon';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.body.style.overflow = 'hidden';
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.body.style.overflow = 'unset';
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return createPortal(
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fade-in"
            onClick={onClose}
        >
            <div
                className="relative max-h-[90vh] w-full max-w-[500px] overflow-y-auto rounded-lg bg-white shadow-[0_10px_25px_rgba(0,0,0,0.1)] animate-slide-up"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between border-b border-slate-200 p-6">
                    {title && (
                        <h3 className="text-xl font-bold text-slate-900">{title}</h3>
                    )}
                    <button
                        onClick={onClose}
                        className="flex items-center justify-center rounded-md p-2 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900"
                        aria-label="Cerrar modal"
                    >
                        <Icon name="close" size="sm" />
                    </button>
                </div>
                <div className="p-6">{children}</div>
            </div>
        </div>,
        document.body
    );
}
