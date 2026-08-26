
import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';

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
                                    <span className="text-2xl font-black tracking-wider text-blue-600 uppercase">
                                        VolleyStats
                                    </span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Contenido Principal */}
                <main className="flex-grow flex items-center justify-center px-6">
                    <div className="mx-auto max-w-md w-full text-center py-12">
                        <h1 className="text-4xl font-extrabold text-blue-900 tracking-tight sm:text-5xl mb-4">
                            ¡Bienvenido a VolleyStats!
                        </h1>
                        
                        <p className="text-lg text-slate-600 mb-8 font-medium">
                            El sistema para la gestión de estadísticas de voleibol.
                        </p>

                        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="w-full sm:w-auto px-8 py-3 rounded-lg bg-blue-700 text-white font-bold shadow-md hover:bg-blue-800 transition duration-150 text-center"
                                >
                                    Ir al Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={route('login')}
                                        className="w-full sm:w-auto px-8 py-3 rounded-lg bg-blue-600 text-white font-bold shadow-md hover:bg-blue-700 transition duration-150 text-center"
                                    >
                                        Ingresar
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        className="w-full sm:w-auto px-8 py-3 rounded-lg bg-yellow-400 text-blue-900 font-bold shadow-md hover:bg-yellow-300 transition duration-150 text-center border border-yellow-500"
                                    >
                                        Registrarse
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </main>

                {/* Footer */}
                <footer className="bg-white border-t border-slate-100 py-6 text-center text-xs font-semibold text-slate-400">
                    <p>© {new Date().getFullYear()} VolleyStats. Todos los derechos reservados.</p>
                </footer>
            </div>
        </>
    );
}
