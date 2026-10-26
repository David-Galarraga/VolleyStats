import React from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import { Input, Select, Text } from "@/Components/Atoms";

interface Combination {
    value: string;
    tournament_id: number;
    tournament_name: string;
    category_id: number;
    category_name: string;
    category_gender: string;
}

interface TeamStanding {
    position: number;
    team_id: number;
    team_name: string;
    matches_played: number;
    matches_won: number;
    matches_lost: number;
    sets_for: number;
    sets_against: number;
    classification_points: number;
    points_scored: number;
}

interface Props {
    combinations: Combination[];
    selectedCombination: Combination | null;
    standings: TeamStanding[];
}

export default function Standings({ combinations, selectedCombination, standings }: Props) {
    const [search, setSearch] = React.useState("");

    React.useEffect(() => {
        setSearch("");
    }, [selectedCombination?.value]);

    const visibleStandings = React.useMemo(() => {
        const term = search.trim().toLowerCase();
        return standings.filter(
            (team) =>
                term === "" || team.team_name.toLowerCase().includes(term)
        );
    }, [standings, search]);

    const handleCombinationChange = (value: string) => {
        router.get("/standings", { combination: value }, { preserveScroll: true, replace: true });
    };

    return (
        <AuthenticatedLayout>
            <Head title={selectedCombination?.tournament_name ?? "Tabla de posiciones"} />

            <div className="py-10 selection:bg-yellow-200">
                <div className="mx-auto max-w-7xl space-y-8 sm:px-6 lg:px-8">
                    <section className="overflow-hidden rounded-lg border-t-4 border-yellow-400 bg-white shadow-md">
                        <div className="p-6 text-slate-900 sm:p-8">
                            <Text variant="h1" color="primary">
                                {selectedCombination?.tournament_name ?? "No hay torneos disponibles"}
                            </Text>
                        </div>
                    </section>

                    <section className="overflow-hidden rounded-lg border-t-4 border-yellow-400 bg-white shadow-md">
                        <div className="border-b border-slate-100 px-5 py-5 sm:px-8">
                            <Text variant="h2" color="primary">Tabla de posiciones</Text>
                            {combinations.length <= 1 && selectedCombination && (
                                <Text variant="p" className="mt-2 text-slate-600">
                                    {selectedCombination.category_name} ({selectedCombination.category_gender})
                                </Text>
                            )}
                        </div>

                        {combinations.length > 1 && selectedCombination && (
                            <div className="px-5 pt-5 sm:px-8">
                                <label htmlFor="standings-combination" className="mb-2 block text-sm font-medium text-slate-700">
                                    Torneo y categoría
                                </label>
                                <Select
                                    id="standings-combination"
                                    value={selectedCombination.value}
                                    onChange={(event) => handleCombinationChange(event.target.value)}
                                    className="max-w-xl"
                                >
                                    {combinations.map((combination) => (
                                        <option key={combination.value} value={combination.value}>
                                            {combination.tournament_name} — {combination.category_name} ({combination.category_gender})
                                        </option>
                                    ))}
                                </Select>
                            </div>
                        )}

                        {selectedCombination && (
                            <div className="px-5 pt-5 sm:px-8">
                                <Input
                                    type="search"
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    placeholder="Buscar por equipo…"
                                    className="max-w-xl"
                                    aria-label="Buscar equipos en la tabla de posiciones"
                                />
                            </div>
                        )}

                        {selectedCombination ? (
                            standings.length > 0 ? (
                                visibleStandings.length > 0 ? (
                                <div className="mt-5 overflow-x-auto">
                                    <table className="min-w-full divide-y divide-slate-200">
                                        <thead className="bg-slate-50">
                                            <tr>
                                                {["Pos.", "Equipo", "PJ", "PG", "PP", "Sets a favor", "Sets en contra", "Puntos tabla", "Puntos anotados"].map((heading) => (
                                                    <th key={heading} scope="col" className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                                                        {heading}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 bg-white">
                                            {visibleStandings.map((team) => (
                                                <tr key={team.team_id} className="hover:bg-slate-50">
                                                    <td className="px-4 py-3 text-sm font-semibold text-slate-700">{team.position}</td>
                                                    <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-900">{team.team_name}</td>
                                                    <td className="px-4 py-3 text-sm text-slate-700">{team.matches_played}</td>
                                                    <td className="px-4 py-3 text-sm text-slate-700">{team.matches_won}</td>
                                                    <td className="px-4 py-3 text-sm text-slate-700">{team.matches_lost}</td>
                                                    <td className="px-4 py-3 text-sm text-slate-700">{team.sets_for}</td>
                                                    <td className="px-4 py-3 text-sm text-slate-700">{team.sets_against}</td>
                                                    <td className="px-4 py-3 text-sm font-semibold text-slate-900">{team.classification_points}</td>
                                                    <td className="px-4 py-3 text-sm text-slate-700">{team.points_scored}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                ) : (
                                    <p className="px-5 py-8 text-center text-sm text-slate-600 sm:px-8">
                                        Sin resultados para los filtros aplicados.
                                    </p>
                                )
                            ) : (
                                <p className="px-5 py-8 text-center text-sm text-slate-600 sm:px-8">
                                    Esta categoría todavía no tiene equipos registrados.
                                </p>
                            )
                        ) : (
                            <p className="px-5 py-8 text-center text-sm text-slate-600 sm:px-8">
                                Todavía no hay categorías asociadas a torneos para mostrar.
                            </p>
                        )}
                    </section>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
