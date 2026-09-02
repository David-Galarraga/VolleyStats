
import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Text, Button, Logo } from '@/Components/Atoms';

export default function Welcome({
    auth,
}: PageProps<{ laravelVersion?: string; phpVersion?: string }>) {
    return (
        <>
            <Head title="Bienvenido a VolleyStats" />
            <div className="min-h-screen bg-white text-slate-900 flex flex-col justify-between selection:bg-yellow-200">
                {/* Cabecera / Navegacion */}
                <header className="border-b-4 border-yellow-400 bg-white">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 items-center justify-between">
                            {/* Logo + Nombre */}
                            <div className="flex items-center gap-3">
                                <Link href="/" className="flex items-center gap-2">
                                    <Logo />
                                </Link>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Contenido Principal */}
                <main className="flex-grow flex items-center justify-center px-6">
                    <div className="mx-auto max-w-md w-full text-center py-12">
                        <Text variant="h1" color="primary">
                            ¡Bienvenido a VolleyStats!
                        </Text>

                        <Text variant="p" className="text-lg text-slate-600 mb-8 font-medium mt-4">
                            El sistema para la gestión de estadísticas de voleibol.
                        </Text>

                        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                            {auth.user ? (
                                <Link href={route('dashboard')}>
                                    <Button variant="primary" size="md">
                                        Ir al Dashboard
                                    </Button>
                                </Link>
                            ) : (
                                <>
                                    <Link href={route('login')}>
                                        <Button variant="primary" size="md">
                                            Ingresar
                                        </Button>
                                    </Link>
                                    <Link href={route('register')}>
                                        <Button variant="secondary" size="md">
                                            Registrarse
                                        </Button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </main>

                {/* Footer */}
                <footer className="bg-white border-t border-slate-100 py-6 text-center text-xs font-semibold text-slate-400">
                    <Text variant="small">
                        © {new Date().getFullYear()} VolleyStats. Todos los derechos reservados.
                    </Text>
                </footer>
            </div>
        </>
    );
}
