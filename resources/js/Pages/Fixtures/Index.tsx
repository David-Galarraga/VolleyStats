import React from "react";
import { router } from "@inertiajs/react";
import { Link, Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Button, Text, Icon } from "@/Components/Atoms";

interface Tournament {
    id: number;
    name_tournament: string;
}

interface Fixture {
    id: number;
    id_tournament: number;
    name_fixture: string;
    start_date: string;
    end_date: string;
    status_fixture: string;
    games_count: number;
    tournament?: Tournament;
}

interface Props {
    fixtures: Fixture[];
}

const statusLabels: Record<string, string> = {
    scheduled: "Programado",
    in_progress: "En curso",
    finished: "Finalizado",
    canceled: "Cancelado",
};

const formatDate = (iso: string) => {
    if (!iso) return "-";
    const normalized = iso.slice(0, 10);
    const [year, month, day] = normalized.split("-");
    if (!year || !month || !day) return "-";
    return `${day}/${month}/${year}`;
};

export default function Index({ fixtures }: Props) {
    const [search, setSearch] = React.useState("");
    const [tournamentFilter, setTournamentFilter] = React.useState<
        number | ""
    >("");
    const [statusFilter, setStatusFilter] = React.useState<string>("");

    const tournaments = React.useMemo(() => {
        const map = new Map<number, string>();
        fixtures.forEach((f) => {
            if (f.tournament) map.set(f.tournament.id, f.tournament.name_tournament);
        });
        return [...map.entries()];
    }, [fixtures]);

    const visibleFixtures = React.useMemo(() => {
        const term = search.trim().toLowerCase();
        return [...fixtures]
            .filter(
                (f) =>
                    (tournamentFilter === "" ||
                        f.id_tournament === tournamentFilter) &&
                    (statusFilter === "" ||
                        f.status_fixture === statusFilter) &&
                    (term === "" ||
                        f.name_fixture.toLowerCase().includes(term) ||
                        f.tournament?.name_tournament
                            .toLowerCase()
                            .includes(term))
            )
            .sort((a, b) => b.start_date.localeCompare(a.start_date));
    }, [fixtures, search, tournamentFilter, statusFilter]);

    const handleDelete = (id: number) => {
        if (confirm("¿Estás seguro de que deseas eliminar este fixture?")) {
            router.delete(`/fixtures/${id}`);
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <Text variant="h2" color="primary">
                    Fixtures
                </Text>
            }
        >
            <Head title="Fixtures" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-md border-t-4 border-yellow-400 sm:rounded-lg">
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-6">
                                <Link href="/dashboard">
                                    <Button variant="secondary" size="sm">
                                        <Icon name="chevronLeft" size="sm" />{" "}
                                        Volver
                                    </Button>
                                </Link>
                                <Link href="/fixtures/create">
                                    <Button variant="primary" size="md">
                                        Nuevo fixture
                                    </Button>
                                </Link>
                            </div>

                            <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Buscar por fixture o torneo…"
                                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400"
                                />
                                <select
                                    value={tournamentFilter}
                                    onChange={(e) =>
                                        setTournamentFilter(
                                            e.target.value === ""
                                                ? ""
                                                : Number(e.target.value)
                                        )
                                    }
                                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400"
                                >
                                    <option value="">Todos los torneos</option>
                                    {tournaments.map(([id, name]) => (
                                        <option key={id} value={id}>
                                            {name}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    value={statusFilter}
                                    onChange={(e) =>
                                        setStatusFilter(e.target.value)
                                    }
                                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400"
                                >
                                    <option value="">Todos los estados</option>
                                    {Object.entries(statusLabels).map(
                                        ([value, label]) => (
                                            <option key={value} value={value}>
                                                {label}
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Nombre
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Torneo
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Sábado
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Domingo
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Partidos
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
                                        {visibleFixtures.map((fixture) => (
                                            <tr
                                                key={fixture.id}
                                                className="hover:bg-gray-50 transition-colors"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                                                    {fixture.name_fixture}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                    {fixture.tournament
                                                        ?.name_tournament ||
                                                        "-"}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                    {formatDate(
                                                        fixture.start_date
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                    {formatDate(
                                                        fixture.end_date
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                    {fixture.games_count}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                    {statusLabels[
                                                        fixture
                                                            .status_fixture
                                                    ] ||
                                                        fixture.status_fixture ||
                                                        "-"}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Link
                                                            href={`/fixtures/${fixture.id}`}
                                                        >
                                                            <Button
                                                                variant="secondary"
                                                                size="sm"
                                                            >
                                                                Ver
                                                            </Button>
                                                        </Link>
                                                        <Link
                                                            href={`/fixtures/${fixture.id}/edit`}
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
                                                                    fixture.id
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

                            {visibleFixtures.length === 0 && (
                                <div className="text-center py-8">
                                    <Text variant="p" color="secondary">
                                        {fixtures.length === 0
                                            ? "No hay fixtures registrados."
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
