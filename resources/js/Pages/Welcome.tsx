import { Head, Link } from "@inertiajs/react";
import { PageProps } from "@/types";
import { Button, Logo, Text } from "@/Components/Atoms";

type WelcomeProps = PageProps<{
    canLogin: boolean;
    canRegister: boolean;
}>;

export default function Welcome({ auth, canLogin, canRegister }: WelcomeProps) {
    return (
        <>
            <Head title="Bienvenido a VolleyStats" />
            <div className="flex min-h-screen flex-col justify-between bg-white text-slate-900 selection:bg-yellow-200">
                <header className="border-b-4 border-yellow-400 bg-white">
                    <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                        <Link href="/" className="flex items-center gap-2">
                            <Logo />
                        </Link>
                        {auth.user ? (
                            <Link href={route("dashboard")}>
                                <Button variant="primary" size="sm">
                                    panel de visualización
                                </Button>
                            </Link>
                        ) : (
                            <div className="flex items-center gap-3">
                                {canLogin && (
                                    <Link href={route("login")}>
                                        <Button variant="primary" size="sm">
                                            Ingresar
                                        </Button>
                                    </Link>
                                )}
                                {canRegister && (
                                    <Link href={route("register")}>
                                        <Button variant="secondary" size="sm">
                                            Registrarse
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>
                </header>

                <main className="flex flex-grow items-center justify-center px-6">
                    <div className="mx-auto w-full max-w-md py-12 text-center">
                        <Text variant="h1" color="primary">
                            ¡Bienvenido a VolleyStats!
                        </Text>
                    </div>
                </main>

                <footer className="border-t border-slate-100 bg-white py-6 text-center text-xs font-semibold text-slate-400">
                    <Text variant="small">
                        © {new Date().getFullYear()} VolleyStats. Todos los derechos reservados.
                    </Text>
                </footer>
            </div>
        </>
    );
}
