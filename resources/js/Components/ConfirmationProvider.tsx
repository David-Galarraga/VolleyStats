import Button from '@/Components/Atoms/Button/Button';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { Dialog, DialogPanel, DialogTitle, Description } from '@headlessui/react';

let request: ((message: string) => Promise<boolean>) | null = null;
export function confirmAction(message: string): Promise<boolean> {
    return request ? request(message) : Promise.resolve(false);
}

export default function ConfirmationProvider({ children }: { children: ReactNode }) {
    const [message, setMessage] = useState<string | null>(null);
    const pending = useRef<((value: boolean) => void) | null>(null);
    const cancelButton = useRef<HTMLButtonElement>(null);
    const settle = (value: boolean) => {
        const resolve = pending.current;
        pending.current = null;
        setMessage(null);
        resolve?.(value);
    };
    useEffect(() => {
        request = (text) => {
            if (pending.current) return Promise.resolve(false);
            return new Promise<boolean>((resolve) => {
                pending.current = resolve;
                setMessage(text);
            });
        };
        return () => { request = null; pending.current?.(false); pending.current = null; };
    }, []);
    return <>
        {children}
        <Dialog open={message !== null} onClose={() => settle(false)} initialFocus={cancelButton} className="relative z-[100]">
            <div className="fixed inset-0 bg-slate-900/50" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center overflow-y-auto p-4">
                <DialogPanel className="w-full max-w-md rounded-lg border-t-4 border-primary bg-white p-6 shadow-xl">
                    <DialogTitle className="text-xl font-semibold text-primary">Confirmar acción</DialogTitle>
                    <Description className="mt-4 text-sm leading-6 text-slate-700">{message}</Description>
                    <div className="mt-6 flex justify-end gap-3">
                        <Button ref={cancelButton} variant="secondary" onClick={() => settle(false)}>Cancelar</Button>
                        <Button onClick={() => settle(true)}>Confirmar</Button>
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    </>;
}
