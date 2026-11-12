import { Logo } from '@/Components/Atoms';
import { Link } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

export default function Guest({ children }: PropsWithChildren) {
    return (
        <div className="flex min-h-screen flex-col bg-slate-100 selection:bg-yellow-200">
            <header className="border-b-4 border-yellow-400 bg-white">
                <div className="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
                    <Link href="/" className="flex items-center gap-2">
                        <Logo />
                    </Link>
                </div>
            </header>

            <main className="flex flex-1 items-center justify-center px-4 py-10">
                <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white px-6 py-8 shadow-sm sm:px-8">
                    {children}
                </div>
            </main>

            <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs font-semibold text-slate-400">
                © {new Date().getFullYear()} VolleyStats. Todos los derechos
                reservados.
            </footer>
        </div>
    );
}