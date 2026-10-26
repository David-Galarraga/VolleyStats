import React from "react";
import { Head, Link, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Button, Input, Select, Text } from "@/Components/Atoms";

interface Tournament { id: number; name_tournament: string; }
interface Fixture { id: number; name_fixture: string; start_date: string; end_date: string; }
interface Category { id_category: number; name_category: string; genero_category: string; }
interface Team { id: number; name_team: string; }
interface Player { player_id: number; name_player: string; dni_player: string; matches_played: number; }
interface Score {
    sets_local: number; sets_visitor: number;
    set_1_points_local: number | null; set_1_points_visitor: number | null;
    set_2_points_local: number | null; set_2_points_visitor: number | null;
    set_3_points_local: number | null; set_3_points_visitor: number | null;
    set_4_points_local: number | null; set_4_points_visitor: number | null;
    set_5_points_local: number | null; set_5_points_visitor: number | null;
}
interface ReportGame {
    id: number;
    phase: string;
    phase_label: string;
    phase_instance: string | null;
    date: string;
    time: string;
    day_of_week: string;
    fixture: Fixture | null;
    category: Category | null;
    team_local: Team | null;
    team_visitor: Team | null;
    sheet: {
        venue: string | null;
        referee_name: string | null;
        scorekeeper_name: string | null;
        has_present_players: boolean;
        players: { player_id: number; team_id: number; name_player: string }[];
    };
    match_result: Score | null;
}
interface Props {
    tournaments: Tournament[];
    phases: Record<string, string>;
    fixtures: Fixture[];
    categories: Category[];
    teams: Team[];
    games: ReportGame[];
    eligiblePlayers: Player[];
    filters: {
        tournament_id: number | null;
        phase: string | null;
        fixture_id: number | null;
        category_id: number | null;
        team_id: number | null;
        minimum: number;
    };
}

const formatDate = (value: string) => {
    const [year, month, day] = value.slice(0, 10).split("-");
    return `${day}/${month}/${year}`;
};
const categoryLabel = (category: Category | null) => {
    if (!category) return "-";
    const gender = category.genero_category.toLowerCase() === "femenino"
        ? "femenina"
        : category.genero_category.toLowerCase() === "masculino"
            ? "masculina"
            : category.genero_category;
    return `${category.name_category} ${gender}`.trim();
};
const scoreLabel = (result: Score | null) => result
    ? `${result.sets_local}-${result.sets_visitor}`
    : "Sin resultado cargado";

export default function Index({ tournaments, phases, fixtures, categories, teams, games, eligiblePlayers, filters }: Props) {
    const changeFilters = (updates: Record<string, string | number | null>) => {
        const params: Record<string, string | number> = {};
        const next = { ...filters, ...updates };
        Object.entries(next).forEach(([key, value]) => {
            if (value !== null && value !== "") params[key] = value;
        });
        router.get(route("match-reports.index"), params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    return (
        <AuthenticatedLayout header={<Text variant="h2" color="primary">Informe de partidos</Text>}>
            <Head title="Informe de partidos" />
            <div className="py-10">
                <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
                    <section className="rounded-lg border-t-4 border-yellow-400 bg-white p-6 shadow-md">
                        <Text variant="h3" color="primary">Consultar partidos</Text>
                        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <label className="text-sm font-medium text-gray-700">Torneo
                                <Select className="mt-1" value={filters.tournament_id ?? ""} onChange={(e) => changeFilters({ tournament_id: e.target.value ? Number(e.target.value) : null, phase: null, fixture_id: null, category_id: null, team_id: null })}>
                                    <option value="">Seleccionar torneo</option>
                                    {tournaments.map((t) => <option key={t.id} value={t.id}>{t.name_tournament}</option>)}
                                </Select>
                            </label>
                            <label className="text-sm font-medium text-gray-700">Fase
                                <Select className="mt-1" disabled={!filters.tournament_id} value={filters.phase ?? ""} onChange={(e) => changeFilters({ phase: e.target.value || null, fixture_id: null, category_id: null, team_id: null })}>
                                    <option value="">Seleccionar fase</option>
                                    {Object.entries(phases).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                                </Select>
                            </label>
                            <label className="text-sm font-medium text-gray-700">Fecha del fixture
                                <Select className="mt-1" disabled={!filters.phase} value={filters.fixture_id ?? ""} onChange={(e) => changeFilters({ fixture_id: e.target.value ? Number(e.target.value) : null, category_id: null, team_id: null })}>
                                    <option value="">Seleccionar fecha</option>
                                    {fixtures.map((f) => <option key={f.id} value={f.id}>{f.name_fixture}</option>)}
                                </Select>
                            </label>
                            <label className="text-sm font-medium text-gray-700">Categoría
                                <Select className="mt-1" disabled={!filters.fixture_id} value={filters.category_id ?? ""} onChange={(e) => changeFilters({ category_id: e.target.value ? Number(e.target.value) : null, team_id: null })}>
                                    <option value="">Seleccionar categoría</option>
                                    {categories.map((c) => <option key={c.id_category} value={c.id_category}>{categoryLabel(c)}</option>)}
                                </Select>
                            </label>
                        </div>

                        {filters.tournament_id && (
                            <div className="mt-6 overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                                        <tr><th className="px-4 py-3">Partido</th><th className="px-4 py-3">Día y hora</th><th className="px-4 py-3">Cancha</th><th className="px-4 py-3">Árbitro / planillero</th><th className="px-4 py-3">Resultado</th><th className="px-4 py-3">Asistencia</th><th className="px-4 py-3" /></tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                                        {games.map((game) => (
                                            <tr key={game.id}>
                                                <td className="px-4 py-3"><div className="font-semibold">{game.team_local?.name_team ?? "-"} vs {game.team_visitor?.name_team ?? "-"}</div><div className="text-xs text-gray-500">{game.phase_label}{game.phase_instance ? ` — ${game.phase_instance}` : ""} · {game.fixture?.name_fixture} · {categoryLabel(game.category)}</div>{(game as any).suspended && <div className="mt-1 text-xs font-medium text-red-600">Partido suspendido</div>}{(game as any).forfeit_type === 'wo' && <div className="mt-1 text-xs font-medium text-orange-600">WO</div>}</td>
                                                <td className="px-4 py-3"><div className="capitalize">{game.day_of_week}</div><div>{formatDate(game.date)} · {game.time.slice(0, 5)}</div></td>
                                                <td className="px-4 py-3">{game.sheet.venue || "-"}</td>
                                                <td className="px-4 py-3">{game.sheet.referee_name || "-"}<div className="text-xs text-gray-500">Planillero: {game.sheet.scorekeeper_name || "-"}</div></td>
                                                <td className="px-4 py-3"><div className="font-medium">{(game as any).suspended ? 'Suspendido' : (game as any).forfeit_type === 'wo' ? '2-0 (25-0/25-0)' : scoreLabel(game.match_result)}</div>{!((game as any).suspended || (game as any).forfeit_type === 'wo') && game.match_result && <div className="text-xs text-gray-500">{[1, 2, 3, 4, 5].map((set) => {
                                                    const local = game.match_result?.[`set_${set}_points_local` as keyof Score];
                                                    const visitor = game.match_result?.[`set_${set}_points_visitor` as keyof Score];
                                                    return local === null || visitor === null || local === undefined || visitor === undefined ? null : <span key={set} className="mr-2">{local}-{visitor}</span>;
                                                })}</div>}</td>
                                                <td className="px-4 py-3">{game.sheet.has_present_players ? `${game.sheet.players.length} presentes` : "Sin jugadoras presentes"}</td>
                                                <td className="px-4 py-3 text-right"><Link href={route("games.show", game.id)}><Button variant="secondary" size="sm">Ver partido</Button></Link></td>
                                            </tr>
                                        ))}
                                        {games.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">No hay partidos con planilla cerrada para los filtros seleccionados.</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>

                    <section className="rounded-lg border-t-4 border-yellow-400 bg-white p-6 shadow-md">
                        <Text variant="h3" color="primary">Elegibilidad para play-offs</Text>
                        <p className="mt-1 text-sm text-gray-600">Cuenta partidos de fase Regular del torneo seleccionado con planilla cerrada y asistencia marcada.</p>
                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                            <label className="text-sm font-medium text-gray-700">Equipo
                                <Select className="mt-1" disabled={!filters.tournament_id || teams.length === 0} value={filters.team_id ?? ""} onChange={(e) => changeFilters({ team_id: e.target.value ? Number(e.target.value) : null })}>
                                    <option value="">Seleccionar equipo</option>
                                    {teams.map((team) => <option key={team.id} value={team.id}>{team.name_team}</option>)}
                                </Select>
                            </label>
                            <label className="text-sm font-medium text-gray-700">Mi­nimo de partidos
                                <Input className="mt-1" type="number" min={1} max={100} value={filters.minimum} onChange={(e) => changeFilters({ minimum: Math.max(1, Number(e.target.value) || 1) })} />
                            </label>
                        </div>
                        {filters.team_id && <div className="mt-5 overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-600"><tr><th className="px-4 py-3">Jugadora</th><th className="px-4 py-3">DNI</th><th className="px-4 py-3">Partidos regulares</th></tr></thead>
                                <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                                    {eligiblePlayers.map((player) => <tr key={player.player_id}><td className="px-4 py-3">{player.name_player}</td><td className="px-4 py-3">{player.dni_player}</td><td className="px-4 py-3">{player.matches_played}</td></tr>)}
                                    {eligiblePlayers.length === 0 && <tr><td colSpan={3} className="px-4 py-6 text-center text-gray-500">No hay jugadoras que alcancen el mínimo seleccionado.</td></tr>}
                                </tbody>
                            </table>
                        </div>}
                    </section>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
