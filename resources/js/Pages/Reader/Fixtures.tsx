import React from "react";
import { Head, Link } from "@inertiajs/react";
import PublicLayout from "@/Layouts/PublicLayout";
import { Button, Input, Select, Text } from "@/Components/Atoms";

interface Tournament {
    id: number;
    name_tournament: string;
}

interface Team {
    id: number;
    name_team: string;
}

interface Game {
    id: number;
    date: string;
    time: string;
    team_local?: Team;
    team_visitor?: Team;
    result?: string;
}

interface Fixture {
    id: number;
    id_tournament: number;
    name_fixture: string;
    start_date: string;
    end_date: string;
    status_fixture: string;
    tournament?: Tournament;
    games: Game[];
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

const sortByTime = (games: Game[]) =>
    [...games].sort((a, b) => (a.time || "").localeCompare(b.time || ""));

export default function Fixtures({ fixtures }: Props) {
    const [search, setSearch] = React.useState("");
    const [tournamentFilter, setTournamentFilter] = React.useState<number | "">("");

    const tournaments = React.useMemo(() => {
        const map = new Map<number, string>();
        fixtures.forEach((fixture) => {
            if (fixture.tournament) {
                map.set(fixture.tournament.id, fixture.tournament.name_tournament);
            }
        });
        return [...map.entries()];
    }, [fixtures]);

    const visibleFixtures = React.useMemo(() => {
        const term = search.trim().toLowerCase();
        return fixtures.filter(
            (fixture) =>
                (tournamentFilter === "" || fixture.id_tournament === tournamentFilter) &&
                (term === "" ||
                    fixture.name_fixture.toLowerCase().includes(term) ||
                    (fixture.tournament?.name_tournament ?? "").toLowerCase().includes(term))
        );
    }, [fixtures, search, tournamentFilter]);

    return (
        <PublicLayout>
            <Head title="Fixtures" />
            <div className="py-10">
                <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
                    <section className="overflow-hidden rounded-lg border-t-4 border-yellow-400 bg-white shadow-md">
                        <div className="p-6 sm:p-8">
                            <Text variant="h1" color="primary">Fixtures</Text>
                            <Text variant="p" className="mt-2 text-slate-600">
                                Próximos partidos programados.
                            </Text>
                        </div>
                    </section>

                    <section className="overflow-hidden rounded-lg border-t-4 border-indigo-400 bg-white shadow-md">
                        <div className="border-b border-slate-100 px-5 py-5 sm:px-8">
                            <Text variant="h2" color="primary">Fixtures futuros</Text>
                        </div>

                        <div className="grid grid-cols-1 gap-3 px-5 pt-5 sm:grid-cols-2 sm:px-8">
                            <Input
                                type="search"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Buscar por fixture o torneo…"
                                aria-label="Buscar fixtures"
                            />
                            <Select
                                value={tournamentFilter}
                                onChange={(event) =>
                                    setTournamentFilter(
                                        event.target.value === "" ? "" : Number(event.target.value)
                                    )
                                }
                                aria-label="Filtrar por torneo"
                            >
                                <option value="">Todos los torneos</option>
                                {tournaments.map(([id, name]) => (
                                    <option key={id} value={id}>
                                        {name}
                                    </option>
                                ))}
                            </Select>
                        </div>

                        <div className="space-y-6 p-5 sm:p-8">
                            {visibleFixtures.length > 0 ? (
                                visibleFixtures.map((fixture) => (
                                    <div key={fixture.id} className="rounded-lg border border-slate-200 p-4">
                                        <div className="mb-2 flex items-center justify-between gap-3">
                                            <div>
                                                <Text variant="h3" color="primary">
                                                    {fixture.tournament?.name_tournament ?? "Sin torneo"}
                                                </Text>
                                                <p className="text-sm text-slate-600">
                                                    {fixture.name_fixture} — {formatDate(fixture.start_date)} a{" "}
                                                    {formatDate(fixture.end_date)}
                                                </p>
                                            </div>
                                            <div className="flex shrink-0 items-center gap-2">
                                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                                                    {statusLabels[fixture.status_fixture] ?? fixture.status_fixture}
                                                </span>
                                                <Link href={`/lector/fixtures/${fixture.id}`}>
                                                    <Button variant="secondary" size="sm">
                                                        Ver
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                        {fixture.games && fixture.games.length > 0 ? (
                                            <ul className="mt-2 space-y-1 text-sm text-slate-700">
                                                {sortByTime(fixture.games).map((game) => (
                                                    <li key={game.id}>
                                                        {game.team_local?.name_team ?? "-"} vs{" "}
                                                        {game.team_visitor?.name_team ?? "-"} —{" "}
                                                        {game.time ? game.time.slice(0, 5) : "-"}
                                                        {game.result ? ` (${game.result})` : ""}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="mt-2 text-sm text-slate-500">
                                                Sin partidos cargados.
                                            </p>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p className="py-8 text-center text-sm text-slate-600">
                                    {fixtures.length === 0
                                        ? "No hay fixtures futuros programados."
                                        : "Sin resultados para los filtros aplicados."}
                                </p>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </PublicLayout>
    );
}
