import React from "react";
import { router } from "@inertiajs/react";
import { Link, Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Button, Text, Icon } from "@/Components/Atoms";

interface Category {
    id_category: number;
    name_category: string;
    genero_category: string;
}

interface Trainer {
    id_trainer: number;
    name_trainer: string;
    phone_trainer: string;
    email_trainer: string;
}

interface Delegate {
    id_delegate: number;
    name_delegate: string;
    email_delegate: string;
    phone_delegate: string;
}

interface Team {
    id: number;
    name_team: string;
    city_team: string;
    id_category: number;
    id_trainer: number;
    id_delegate: number;
    category?: Category;
    trainer?: Trainer;
    delegate?: Delegate;
}

interface Props {
    teams: Team[];
}

export default function Index({ teams }: Props) {
    const handleDelete = (id: number) => {
        if (confirm("¿Estás seguro de que deseas eliminar este equipo?")) {
            router.delete(`/teams/${id}`);
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <Text variant="h2" color="primary">
                    Equipos
                </Text>
            }
        >
            <Head title="Equipos" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-md border-t-4 border-yellow-400 sm:rounded-lg">
                        <div className="p-8">
                            {/* Header con botón volver y crear */}
                            <div className="flex items-center justify-between mb-8">
                                <Link href="/dashboard">
                                    <Button variant="secondary" size="sm">
                                        <Icon name="chevronLeft" size="sm" /> Volver
                                    </Button>
                                </Link>
                                <Link href="/teams/create">
                                    <Button variant="primary" size="md">
                                        Nuevo equipo
                                    </Button>
                                </Link>
                            </div>

                            {/* Tabla de equipos */}
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Nombre
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Ciudad
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Categoría
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Entrenador
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Delegado
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Acciones
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {teams.map((team) => (
                                            <tr
                                                key={team.id}
                                                className="hover:bg-gray-50 transition-colors"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                                                    {team.name_team}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                    {team.city_team}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                    {team.category?.name_category || "-"}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                    {team.trainer?.name_trainer || "-"}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                    {team.delegate?.name_delegate || "-"}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Link
                                                            href={`/teams/${team.id}/edit`}
                                                        >
                                                            <Button
                                                                variant="secondary"
                                                                size="sm"
                                                            >
                                                                Editar
                                                            </Button>
                                                        </Link>
                                                        <Button
                                                            variant="danger"
                                                            size="sm"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    team.id
                                                                )
                                                            }
                                                        >
                                                            Eliminar
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {teams.length === 0 && (
                                <div className="text-center py-8">
                                    <Text variant="p" color="secondary">
                                        No hay equipos registrados.
                                    </Text>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
