import React from "react";
import { Head } from "@inertiajs/react";
import PublicLayout from "@/Layouts/PublicLayout";
import { Input, Text } from "@/Components/Atoms";

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

export default function ReaderIndex({ combinations, selectedCombination, standings }: Props) {
    const [search, setSearch] = React.useState("");
    const [combination, setCombination] = React.useState(selectedCombination?.value ?? "");

    React.useEffect(() => {
        setCombination(selectedCombination?.value ?? "");
    }, [selectedCombination?.value]);

    const visibleStandings = React.useMemo(() => {
        const term = search.trim().toLowerCase();
        return (standings ?? []).filter((t) => term === "" || t.team_name.toLowerCase().includes(term));
    }, [standings, search]);

    return (
        <PublicLayout>
            <Head title="Posiciones" />
            <div className="py-10">
                <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
                    <section className="overflow-hidden rounded-lg border-t-4 border-yellow-400 bg-white shadow-md">
                        <div className="p-6 sm:p-8">
                            <Text variant="h1" color="primary">Posiciones</Text>
                        </div>
                    </section>

                    <section className="overflow-hidden rounded-lg border-t-4 border-yellow-400 bg-white shadow-md">
                        <div className="border-b border-slate-100 px-5 py-5 sm:px-8">
                            <Text variant="h2" color="primary">Tabla de posiciones</Text>
                        </div>

                        {combinations.length > 1 && selectedCombination && (
                            <div className="px-5 pt-5 sm:px-8">
                                <label htmlFor="reader-combination" className="mb-2 block text-sm font-medium text-slate-700">
                                    Torneo y categoría
                                </label>
                                <select
                                    id="reader-combination"
                                    value={combination}
                                    onChange={(e) => { setCombination(e.target.value); window.location.href = "/lector?combination=" + encodeURIComponent(e.target.value); }}
                                    className="max-w-xl rounded border-slate-300"
                                >
                                    {combinations.map((c) => (
                                        <option key={c.value} value={c.value}>
                                            {c.tournament_name} — {c.category_name} ({c.category_gender})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {selectedCombination && (
                            <div className="px-5 pt-5 sm:px-8">
                                <Input
                                    type="search"
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    placeholder="Buscar por equipo…"
                                    className="max-w-xl"
                                    aria-label="Buscar equipos"
                                />
                            </div>
                        )}

                        {selectedCombination ? (
                            (standings ?? []).length > 0 ? (
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
                                    <p className="px-5 py-8 text-center text-sm text-slate-600 sm:px-8">Sin resultados para los filtros aplicados.</p>
                                )
                            ) : (
                                <p className="px-5 py-8 text-center text-sm text-slate-600 sm:px-8">Esta categoría todavía no tiene equipos registrados.</p>
                            )
                        ) : (
                            <p className="px-5 py-8 text-center text-sm text-slate-600 sm:px-8">Todavía no hay categorías asociadas a torneos para mostrar.</p>
                        )}
                    </section>
                </div>
            </div>
        </PublicLayout>
    );
}
