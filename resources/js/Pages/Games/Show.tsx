import React from "react";
import { Link, Head, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Button, Text, Icon } from "@/Components/Atoms";

interface Category { name_category: string; genero_category: string; }
interface Team { id: number; name_team: string; }
interface Tournament { name_tournament: string; }
interface Fixture { id: number; name_fixture?: string; }
interface MatchResult {
    sets_local: number;
    sets_visitor: number;
    set_1_points_local: number;
    set_1_points_visitor: number;
    set_2_points_local: number;
    set_2_points_visitor: number;
    set_3_points_local: number | null;
    set_3_points_visitor: number | null;
    set_4_points_local: number | null;
    set_4_points_visitor: number | null;
    set_5_points_local: number | null;
    set_5_points_visitor: number | null;
}
interface SheetPlayer {
    player_id: number;
    team_id: number;
    name_player: string;
    present: boolean;
}
interface Game {
    id: number;
    date: string;
    time: string;
    status_game: string;
    phase: string;
    phase_instance: string | null;
    day?: string | null;
    tournament?: Tournament;
    category?: Category | null;
    fixture?: Fixture;
    team_local?: Team;
    team_visitor?: Team;
    match_result?: MatchResult | null;
    sheet?: { venue: string | null; referee_name: string | null; scorekeeper_name: string | null; players: SheetPlayer[] } | null;
}

const formatDate = (iso?: string | null) => {
    if (!iso) return "-";
    const [year, month, day] = iso.slice(0, 10).split("-");
    return `${day}/${month}/${year}`;
};
const categoryLabel = (category?: Category | null) => {
    if (!category) return "-";
    const gender = category.genero_category.toLowerCase() === "femenino"
        ? "femenina"
        : category.genero_category.toLowerCase() === "masculino"
            ? "masculina"
            : category.genero_category;
    return `${category.name_category} ${gender}`.trim();
};

export default function Show({ game, phaseLabel, dayOfWeek }: { game: Game; phaseLabel: string; dayOfWeek: string | null }) {
    const presentPlayers = (game.sheet?.players ?? []).filter((player) => player.present);
    const result = game.match_result;
    const teams = [
        { team: game.team_local, id: game.team_local?.id },
        { team: game.team_visitor, id: game.team_visitor?.id },
    ];

    return (
        <AuthenticatedLayout header={<Text variant="h2" color="primary">Detalle del Partido</Text>}>
            <Head title="Detalle del Partido" />
            <div className="py-12">
                <div className="mx-auto max-w-5xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden rounded-lg border-t-4 border-yellow-400 bg-white shadow-md">
                        <div className="p-8">
                            <div className="mb-8 flex items-center justify-between">
                                <Link href={game.fixture ? `/fixtures/${game.fixture.id}` : "/fixtures"}>
                                    <Button variant="secondary" size="sm"><Icon name="chevronLeft" size="sm" /> Volver</Button>
                                </Link>
                                <div className="flex items-center gap-2">
                                    <Link href={`/games/${game.id}/planilla`}><Button variant="primary" size="md">Planilla</Button></Link>
                                    <Link href={`/games/${game.id}/edit`}><Button variant="secondary" size="md">Editar</Button></Link>
                                    <Button variant="danger" size="md" onClick={() => {
                                        if (confirm("¿Estás seguro de que deseas eliminar este partido?")) router.delete(`/games/${game.id}`);
                                    }}>Eliminar</Button>
                                </div>
                            </div>

                            <div className="mb-8 text-center">
                                <Text variant="h3" color="primary">{game.team_local?.name_team || "-"} vs {game.team_visitor?.name_team || "-"}</Text>
                            </div>

                            <dl className="mb-8 grid gap-4 rounded-lg border border-gray-200 p-6 sm:grid-cols-2">
                                <div><dt className="text-xs font-semibold uppercase text-gray-500">Torneo</dt><dd className="text-sm text-gray-700">{game.tournament?.name_tournament || "-"}</dd></div>
                                <div><dt className="text-xs font-semibold uppercase text-gray-500">Categoría</dt><dd className="text-sm text-gray-700">{categoryLabel(game.category)}</dd></div>
                                <div><dt className="text-xs font-semibold uppercase text-gray-500">Fase</dt><dd className="text-sm text-gray-700">{game.phase === "playoff" && game.phase_instance ? `${phaseLabel} — ${game.phase_instance}` : phaseLabel}</dd></div>
                                <div><dt className="text-xs font-semibold uppercase text-gray-500">Jornada</dt><dd className="text-sm text-gray-700">{game.fixture?.name_fixture || "-"}</dd></div>
                                <div><dt className="text-xs font-semibold uppercase text-gray-500">Día</dt><dd className="text-sm capitalize text-gray-700">{dayOfWeek || "-"}</dd></div>
                                <div><dt className="text-xs font-semibold uppercase text-gray-500">Fecha</dt><dd className="text-sm text-gray-700">{formatDate(game.date)}</dd></div>
                                <div><dt className="text-xs font-semibold uppercase text-gray-500">Hora</dt><dd className="text-sm text-gray-700">{game.time ? game.time.slice(0, 5) : "-"}</dd></div>
                                <div><dt className="text-xs font-semibold uppercase text-gray-500">Cancha</dt><dd className="text-sm text-gray-700">{game.sheet?.venue || "-"}</dd></div>
                                <div><dt className="text-xs font-semibold uppercase text-gray-500">Árbitro</dt><dd className="text-sm text-gray-700">{game.sheet?.referee_name || "-"}</dd></div>
                                <div><dt className="text-xs font-semibold uppercase text-gray-500">Planillero</dt><dd className="text-sm text-gray-700">{game.sheet?.scorekeeper_name || "-"}</dd></div>
                                <div><dt className="text-xs font-semibold uppercase text-gray-500">Estado</dt><dd className="text-sm text-gray-700">{game.status_game}</dd></div>
                            </dl>

                            <section className="mb-8 rounded-lg border border-gray-200 p-6">
                                <Text variant="h3" color="primary">Jugadoras presentes</Text>
                                {presentPlayers.length === 0 ? (
                                    <p className="mt-4 text-center text-sm text-gray-500">Sin jugadoras presentes.</p>
                                ) : (
                                    <div className="mt-4 grid gap-6 md:grid-cols-2">
                                        {teams.map(({ team, id }, index) => {
                                            if (!team || !id) return null;
                                            const players = presentPlayers.filter((player) => player.team_id === id);
                                            return <div key={id}>
                                                <h4 className="mb-2 font-semibold text-gray-700">{index === 0 ? "Local" : "Visitante"}: {team.name_team}</h4>
                                                {players.length ? <ul className="list-inside list-disc text-sm text-gray-700">{players.map((player) => <li key={player.player_id}>{player.name_player}</li>)}</ul> : <p className="text-sm text-gray-500">Sin jugadores presentes cargados.</p>}
                                            </div>;
                                        })}
                                    </div>
                                )}
                            </section>

                            <section className="rounded-lg border border-gray-200 p-6">
                                <Text variant="h3" color="primary">{result ? `${game.team_local?.name_team || "Local"} ${result.sets_local}–${result.sets_visitor} ${game.team_visitor?.name_team || "Visitante"}` : "Sin resultado cargado"}</Text>
                                {result ? <div className="mt-4 overflow-x-auto">
                                    <table className="w-full border-collapse text-center">
                                        <thead><tr className="border-b text-sm text-gray-600"><th className="px-3 py-2 text-left">Set</th><th className="px-3 py-2">{game.team_local?.name_team || "Local"}</th><th className="px-3 py-2">{game.team_visitor?.name_team || "Visitante"}</th></tr></thead>
                                        <tbody className="text-sm text-gray-800">
                                            {[1, 2, 3, 4, 5].map((set) => {
                                                const local = result[`set_${set}_points_local` as keyof MatchResult];
                                                const visitor = result[`set_${set}_points_visitor` as keyof MatchResult];
                                                if (local === null || visitor === null || local === undefined || visitor === undefined) return null;
                                                return <tr key={set} className="border-b border-gray-100"><th className="px-3 py-2 text-left">{set}</th><td className="px-3 py-2">{local}</td><td className="px-3 py-2">{visitor}</td></tr>;
                                            })}
                                        </tbody>
                                    </table>
                                </div> : <p className="mt-4 text-center text-sm text-gray-500">La planilla todavía no tiene resultado cargado.</p>}
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
