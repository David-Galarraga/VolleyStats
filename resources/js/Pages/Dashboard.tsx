import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function Dashboard() {
    return (
        <AuthenticatedLayout>
            <Head title="Dashboard"/>

            <div className="py-12 selection:bg-yellow-200">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-md border-t-4 border-yellow-400 sm:rounded-lg">
                        <div className="p-8 text-slate-900">
                            <h3 className="text-2xl font-extrabold text-blue-900 mb-4">
                                ¡Bienvenido a <span className="text-blue-600 font-bold">VolleyStats</span>!
                            </h3>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

