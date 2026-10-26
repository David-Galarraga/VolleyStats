import React from "react";
import { router } from "@inertiajs/react";
import { Link, Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Button, Input, Select, Text, Icon } from "@/Components/Atoms";

interface Tournament {
    id: number;
    name_tournament: string;
    start_date: string;
    end_date: string;
    status_tournament: string | null;
}

interface Props {
    tournaments: Tournament[];
}

const statusLabels: Record<string, string> = {
    scheduled: "Programado",
    in_progress: "En curso",
    finished: "Finalizado",
    canceled: "Cancelado",
};

export default function Index({ tournaments }: Props) {
    const [search, setSearch] = React.useState("");
    const [statusFilter, setStatusFilter] = React.useState("");

    const hasTournamentsWithoutStatus = React.useMemo(
        () => tournaments.some((tournament) => !tournament.status_tournament),
        [tournaments]
    );

    const visibleTournaments = React.useMemo(() => {
        const term = search.trim().toLowerCase();
        return tournaments.filter((tournament) => {
            const matchesName =
                term === "" ||
                tournament.name_tournament.toLowerCase().includes(term);
            const matchesStatus =
                statusFilter === "" ||
                (statusFilter === "__none__"
                    ? !tournament.status_tournament
                    : tournament.status_tournament === statusFilter);
            return matchesName && matchesStatus;
        });
    }, [tournaments, search, statusFilter]);

    const handleDelete = (id: number) => {
        if (confirm("¿Estás seguro de que deseas eliminar este torneo?")) {
            router.delete(`/tournaments/${id}`);
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <Text variant="h2" color="primary">
                    Torneos
                </Text>
            }
        >
            <Head title="Torneos" />

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
                                <Link href="/tournaments/create">
                                    <Button variant="primary" size="md">
                                        Nuevo torneo
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
                                    aria-label="Buscar torneos por nombre"
                                />
                                <Select
                                    value={statusFilter}
                                    onChange={(event) =>
                                        setStatusFilter(event.target.value)
                                    }
                                    aria-label="Filtrar torneos por estado"
                                >
                                    <option value="">Todos los estados</option>
                                    {Object.entries(statusLabels).map(
                                        ([value, label]) => (
                                            <option key={value} value={value}>
                                                {label}
                                            </option>
                                        )
                                    )}
                                    {hasTournamentsWithoutStatus && (
                                        <option value="__none__">
                                            Sin estado
                                        </option>
                                    )}
                                </Select>
                            </div>

                            {/* Tabla de torneos */}
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Nombre
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Inicio
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Fin
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Estado
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Acciones
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {visibleTournaments.map((tournament) => (
                                            <tr
                                                key={tournament.id}
                                                className="hover:bg-gray-50 transition-colors"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                                                    {tournament.name_tournament}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                    {tournament.start_date}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                    {tournament.end_date}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                    {tournament.status_tournament
                                                        ? statusLabels[
                                                              tournament
                                                                  .status_tournament
                                                          ] ||
                                                          tournament.status_tournament
                                                        : "-"}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Link
                                                            href={`/tournaments/${tournament.id}/edit`}
                                                        >
                                                            <Button
                                                                variant="secondary"
                                                                size="sm"
                                                            >
                                                                Editar
                                                            </Button>
                                                        </Link>
                                                        <Link href={`/tournaments/${tournament.id}`}>
                                                            <Button variant="secondary" size="sm">Ver</Button>
                                                        </Link>
                                                        <Button
                                                            variant="danger"
                                                            size="sm"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    tournament.id
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

                            {visibleTournaments.length === 0 && (
                                <div className="text-center py-8">
                                    <Text variant="p" color="secondary">
                                        {tournaments.length === 0
                                            ? "No hay torneos registrados."
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
