import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';
import { PropsWithChildren } from 'react';
import { Button } from '@/Components/Atoms';

export default function PublicLayout({ children }: PropsWithChildren) {
    const canLogin = route().has('login');
    const canRegister = route().has('register');

    return (
        <div className="min-h-screen bg-gray-100 selection:bg-yellow-200">
            <nav className="border-b-4 border-yellow-400 bg-white">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <Link href="/" className="flex items-center gap-2">
                        <ApplicationLogo className="h-8 w-auto fill-current text-gray-700" />
                    </Link>
                    <div className="flex items-center gap-3">
                        <Link href="/lector">
                            <Button variant="secondary" size="sm">
                                Posiciones y fixtures
                            </Button>
                        </Link>
                        {canLogin && (
                            <Link href={route('login')}>
                                <Button variant="primary" size="sm">
                                    Ingresar
                                </Button>
                            </Link>
                        )}
                        {canRegister && (
                            <Link href={route('register')}>
                                <Button variant="secondary" size="sm">
                                    Registrarse
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
            </nav>

            <main>{children}</main>

            <footer className="border-t border-slate-100 bg-white py-6 text-center text-xs font-semibold text-slate-400">
                © {new Date().getFullYear()} VolleyStats. Todos los derechos reservados.
            </footer>
        </div>
    );
}
