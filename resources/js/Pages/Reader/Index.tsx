import React from "react";
import { Head, router } from "@inertiajs/react";
import PublicLayout from "@/Layouts/PublicLayout";
import { Button, Input, Select, Text } from "@/Components/Atoms";
import PlayoffBracket, { BracketMatch } from "@/Components/PlayoffBracket/PlayoffBracket";

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
    playoffBracket: { id: number; matches: BracketMatch[] } | null;
}

export default function ReaderIndex({ combinations, selectedCombination, standings, playoffBracket }: Props) {
    const [search, setSearch] = React.useState("");
    const [tournamentId, setTournamentId] = React.useState<number | null>(
        selectedCombination?.tournament_id ?? null
    );

    const tournaments = React.useMemo(() => {
        const seen = new Map<number, string>();
        combinations.forEach((combination) => {
            if (!seen.has(combination.tournament_id)) {
                seen.set(combination.tournament_id, combination.tournament_name);
            }
        });
        return Array.from(seen, ([id, name]) => ({
            tournament_id: id,
            tournament_name: name,
        }));
    }, [combinations]);

    React.useEffect(() => {
        setTournamentId(
            selectedCombination?.tournament_id ?? tournaments[0]?.tournament_id ?? null
        );
    }, [selectedCombination?.value, tournaments]);

    React.useEffect(() => {
        setSearch("");
    }, [selectedCombination?.value]);

    const activeTournamentId =
        tournamentId ?? selectedCombination?.tournament_id ?? tournaments[0]?.tournament_id ?? null;

    const categories = React.useMemo(
        () => combinations.filter((item) => item.tournament_id === activeTournamentId),
        [combinations, activeTournamentId]
    );

    const goToCombination = (value: string) => {
        router.get(route("lector.index"), { combination: value }, {
            preserveScroll: true,
            replace: true,
        });
    };

    const handleTournamentChange = (value: string) => {
        const nextTournamentId = Number(value);
        setTournamentId(nextTournamentId);
        const firstCategory = combinations.find(
            (combination) => combination.tournament_id === nextTournamentId
        );
        if (firstCategory) {
            goToCombination(firstCategory.value);
        }
    };

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

                        {tournaments.length > 0 && (
                            <div className="space-y-4 px-5 pt-5 sm:px-8">
                                <div>
                                    <label htmlFor="reader-tournament" className="mb-2 block text-sm font-medium text-slate-700">
                                        Torneo
                                    </label>
                                    <Select
                                        id="reader-tournament"
                                        value={activeTournamentId ?? ""}
                                        onChange={(event) => handleTournamentChange(event.target.value)}
                                        className="max-w-xl"
                                    >
                                        {tournaments.map((item) => (
                                            <option key={item.tournament_id} value={item.tournament_id}>
                                                {item.tournament_name}
                                            </option>
                                        ))}
                                    </Select>
                                </div>
                                <div role="group" aria-label="Categorías" className="flex flex-wrap gap-3">
                                    {categories.map((item) => (
                                        <Button
                                            key={item.value}
                                            onClick={() => goToCombination(item.value)}
                                            aria-pressed={selectedCombination?.value === item.value}
                                            className={"focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 " + (selectedCombination?.value === item.value ? "ring-2 ring-primary ring-offset-2" : "hover:opacity-90")}
                                        >
                                            {item.category_name} ({item.category_gender})
                                        </Button>
                                    ))}
                                </div>
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
                                    aria-label="Buscar equipos en la tabla de posiciones"
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
                            <p className="px-5 py-8 text-center text-sm text-slate-600 sm:px-8">
                                {categories.length > 0
                                    ? "Seleccioná una categoría para ver su tabla de posiciones."
                                    : "Todavía no hay categorías asociadas a torneos para mostrar."}
                            </p>
                        )}
                    </section>

                    {selectedCombination && playoffBracket && playoffBracket.matches.length > 0 && (
                        <section className="overflow-hidden rounded-lg border-t-4 border-indigo-400 bg-white shadow-md">
                            <div className="border-b border-slate-100 px-5 py-5 sm:px-8">
                                <Text variant="h2" color="primary">Prode de play off</Text>
                                <p className="mt-1 text-sm text-slate-600">
                                    Cuadro de {selectedCombination.category_name}; los cruces muestran sus códigos
                                    para referenciar ganadores y perdedores.
                                </p>
                            </div>
                            <div className="p-5 sm:p-8">
                                <PlayoffBracket matches={playoffBracket.matches} />
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </PublicLayout>
    );
}
