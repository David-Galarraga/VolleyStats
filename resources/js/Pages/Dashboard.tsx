import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import { Text } from "@/Components/Atoms";

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

export default function Dashboard({ combinations, selectedCombination, standings }: Props) {
    const handleCombinationChange = (value: string) => {
        router.get("/dashboard", { combination: value }, { preserveScroll: true, replace: true });
    };

    return (
        <AuthenticatedLayout>
            <Head title={selectedCombination?.tournament_name ?? "Dashboard"} />

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
                                <select
                                    id="standings-combination"
                                    value={selectedCombination.value}
                                    onChange={(event) => handleCombinationChange(event.target.value)}
                                    className="w-full max-w-xl rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400"
                                >
                                    {combinations.map((combination) => (
                                        <option key={combination.value} value={combination.value}>
                                            {combination.tournament_name} — {combination.category_name} ({combination.category_gender})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {selectedCombination ? (
                            standings.length > 0 ? (
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
                                            {standings.map((team) => (
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
