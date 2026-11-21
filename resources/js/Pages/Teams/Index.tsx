import { confirmAction } from '@/Components/ConfirmationProvider';
import React from "react";
import { router } from "@inertiajs/react";
import { Link, Head } from "@inertiajs/react";
import FormErrors from "@/Components/FormErrors";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Button, Input, Text, Icon } from "@/Components/Atoms";

interface Category {
    id_category: number;
    name_category: string;
    genero_category: string;
}

interface Team {
    id: number;
    name_team: string;
    city_team: string;
    id_category: number;
    category?: Category;
}

interface Props {
    teams: Team[];
    tournament: { id: number; name_tournament: string };
    category: Category;
}

export default function Index({ teams, tournament, category }: Props) {
    const [search, setSearch] = React.useState("");
    const categoriesUrl = `/tournaments/${tournament.id}/categories`;
    const base = `${categoriesUrl}/${category.id_category}/teams`;
    const term = search.trim().toLowerCase();
    const visibleTeams = teams.filter(team => team.name_team.toLowerCase().includes(term));

    const handleDelete = async (id: number) => {
        if (await confirmAction("¿Estás seguro de que deseas eliminar este equipo?")) {
            router.delete(`${base}/${id}`);
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <Text variant="h2" color="primary">
                    Equipos · {tournament.name_tournament}
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
                                <Link href={categoriesUrl}>
                                    <Button variant="secondary" size="sm">
                                        <Icon name="chevronLeft" size="sm" /> Volver a categorías
                                    </Button>
                                </Link>
                                <Link href={base + "/create"}>
                                    <Button variant="primary" size="md">
                                        Nuevo equipo
                                    </Button>
                                </Link>
                            </div>

                            <div className="mb-6 max-w-sm">
                                <Input
                                    type="search"
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    placeholder="Buscar por nombre…"
                                    aria-label="Buscar equipos por nombre"
                                />
                            </div>

                            <FormErrors />
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
                                            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Acciones
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {visibleTeams.map((team) => (
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
                                                    {team.category ? `${team.category.name_category} (${team.category.genero_category})` : "-"}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Link href={`${base}/${team.id}/players`}>
                                                            <Button variant="secondary" size="sm">
                                                                Ver jugadoras
                                                            </Button>
                                                        </Link>
                                                        <Link href={`${base}/${team.id}/delegate`}>
                                                            <Button variant="secondary" size="sm">
                                                                Ver delegado
                                                            </Button>
                                                        </Link>
                                                        <Link
                                                            href={`${base}/${team.id}/edit`}
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

                            {visibleTeams.length === 0 && (
                                <div className="text-center py-8">
                                    <Text variant="p" color="secondary">
                                        {teams.length === 0
                                            ? "No hay equipos registrados."
                                            : "Sin resultados para los filtros aplicados."}
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
