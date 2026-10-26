import React from "react";
import { router } from "@inertiajs/react";
import { Link, Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Button, Input, Select, Text, Icon } from "@/Components/Atoms";

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
}

export default function Index({ teams }: Props) {
    const [search, setSearch] = React.useState("");
    const [categoryFilter, setCategoryFilter] = React.useState<number | "">(
        ""
    );

    const categories = React.useMemo(() => {
        const map = new Map<number, Category>();
        teams.forEach((team) => {
            if (team.category) map.set(team.category.id_category, team.category);
        });
        return [...map.values()].sort(
            (a, b) =>
                a.name_category.localeCompare(b.name_category) ||
                a.genero_category.localeCompare(b.genero_category)
        );
    }, [teams]);

    const visibleTeams = React.useMemo(() => {
        const term = search.trim().toLowerCase();
        return teams.filter(
            (team) =>
                (term === "" ||
                    team.name_team.toLowerCase().includes(term)) &&
                (categoryFilter === "" ||
                    team.id_category === categoryFilter)
        );
    }, [teams, search, categoryFilter]);

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
                                <Link href="/standings">
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

                            <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <Input
                                    type="search"
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    placeholder="Buscar por nombre…"
                                    aria-label="Buscar equipos por nombre"
                                />
                                <Select
                                    value={categoryFilter}
                                    onChange={(event) =>
                                        setCategoryFilter(
                                            event.target.value === ""
                                                ? ""
                                                : Number(event.target.value)
                                        )
                                    }
                                    aria-label="Filtrar equipos por categoría"
                                >
                                    <option value="">Todas las categorías</option>
                                    {categories.map((category) => (
                                        <option
                                            key={category.id_category}
                                            value={category.id_category}
                                        >
                                            {category.name_category} (
                                            {category.genero_category})
                                        </option>
                                    ))}
                                </Select>
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
                                                        <Link href={`/teams/${team.id}/players`}>
                                                            <Button variant="secondary" size="sm">
                                                                Ver jugadores
                                                            </Button>
                                                        </Link>
                                                        <Link href={`/teams/${team.id}/delegate`}>
                                                            <Button variant="secondary" size="sm">
                                                                Ver delegado
                                                            </Button>
                                                        </Link>
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
