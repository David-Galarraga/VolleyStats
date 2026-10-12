import { router } from "@inertiajs/react";
import { Link, Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Button, Text, Icon } from "@/Components/Atoms";

interface Trainer {
    id_trainer: number;
    name_trainer: string;
    dni_trainer: string | null;
    birthdate_trainer: string | null;
}

export default function Index({ trainers }: { trainers: Trainer[] }) {
    const handleDelete = (id: number) => {
        if (confirm("¿Estás seguro de que deseas eliminar este entrenador?")) {
            router.delete(`/trainers/${id}`);
        }
    };

    return (
        <AuthenticatedLayout header={<Text variant="h2" color="primary">Entrenadores</Text>}>
            <Head title="Entrenadores" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden rounded-lg border-t-4 border-yellow-400 bg-white shadow-md">
                        <div className="p-8">
                            <div className="mb-8 flex justify-end">
                                <Link href="/trainers/create"><Button variant="primary" size="md">Nuevo entrenador</Button></Link>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50"><tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-600">Nombre y apellido</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-600">DNI</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-600">Fecha de nacimiento</th>
                                        <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-gray-600">Acciones</th>
                                    </tr></thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {trainers.map((trainer) => (
                                            <tr key={trainer.id_trainer}>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-700">{trainer.name_trainer}</td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">{trainer.dni_trainer || "-"}</td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">{trainer.birthdate_trainer || "-"}</td>
                                                <td className="whitespace-nowrap px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Link href={`/trainers/${trainer.id_trainer}/edit`}><Button variant="secondary" size="sm">Editar</Button></Link>
                                                        <Button variant="danger" size="sm" onClick={() => handleDelete(trainer.id_trainer)}>Eliminar</Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {trainers.length === 0 && <div className="py-8 text-center"><Text variant="p" color="secondary">No hay entrenadores registrados.</Text></div>}
                            <div className="mt-6"><Link href="/dashboard"><Button variant="secondary" size="sm"><Icon name="chevronLeft" size="sm" /> Volver</Button></Link></div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
