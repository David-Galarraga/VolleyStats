import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Text, Button, Badge } from '@/Components/Atoms';

export default function Dashboard() {
    return (
        <AuthenticatedLayout>
            <Head title="Dashboard"/>

            <div className="py-12 selection:bg-yellow-200">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-md border-t-4 border-yellow-400 sm:rounded-lg">
                        <div className="p-8 text-slate-900">
                            <Text variant="h2" color="primary">
                                ¡Bienvenido a <span className="text-blue-600 font-bold">VolleyStats</span>!
                            </Text>

                            <div className="mt-6 flex flex-wrap items-center gap-3">
                                <Badge message="Sistema activo" variant="success" size="sm" />
                                <Badge message="Temporada 2026" variant="info" size="sm" />
                            </div>

                            <div className="mt-8 flex flex-wrap gap-4">
                                <Button variant="primary" size="md">
                                    Ver Estadísticas
                                </Button>
                                <Button variant="secondary" size="md">
                                    Gestionar Equipos
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
