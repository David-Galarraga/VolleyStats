import { Link } from '@inertiajs/react';
import { PropsWithChildren } from 'react';
import { Button, Logo } from '@/Components/Atoms';
import NavLink from '@/Components/NavLink';

const navigation = [
    { name: 'Posiciones', href: () => route('lector.index'), pattern: 'lector.index' },
    { name: 'Partidos', href: () => route('lector.fixtures.index'), pattern: 'lector.fixtures.*' },
];

export default function PublicLayout({ children }: PropsWithChildren) {
    const canLogin = route().has('login');
    const canRegister = route().has('register');

    const navItems = navigation.map((item) => (
        <NavLink
            key={item.name}
            href={item.href()}
            active={!!route().current(item.pattern)}
        >
            {item.name}
        </NavLink>
    ));

    return (
        <div className="min-h-screen bg-gray-100 selection:bg-yellow-200">
            <nav className="border-b-4 border-yellow-400 bg-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between gap-4">
                        <div className="flex min-w-0 items-center gap-4">
                            <Link href="/" className="shrink-0">
                                <Logo />
                            </Link>
                            <div className="hidden items-center gap-1 sm:flex">{navItems}</div>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
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
                    <div className="flex items-center gap-1 border-t border-slate-100 pb-1 sm:hidden">
                        {navItems}
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
