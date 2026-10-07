import React from "react";
import { Link, Head, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Button, Text, Icon } from "@/Components/Atoms";

interface Tournament {
    id: number;
    name_tournament: string;
}

interface Team {
    id: number;
    name_team: string;
}

interface Referee {
    id: number;
    name_referee: string;
}

interface Fixture {
    id: number;
}

interface MatchResult {
    sets_local: number;
    sets_visitor: number;
    set_1_points_local: number;
    set_1_points_visitor: number;
    set_2_points_local: number;
    set_2_points_visitor: number;
    set_3_points_local: number | null;
    set_3_points_visitor: number | null;
}

interface RosterSummary {
    team_id: number;
    submitted_at: string | null;
    players_count: number;
}

interface Game {
    id: number;
    date: string;
    time: string;
    status_game: string;
    set_local: number | null;
    set_visitor: number | null;
    result: string;
    day?: string | null;
    tournament?: Tournament;
    fixture?: Fixture;
    team_local?: Team;
    team_visitor?: Team;
    referee?: Referee;
    match_result?: MatchResult | null;
    rosters?: RosterSummary[];
}

interface Props {
    game: Game;
}

const formatDate = (iso: string) => {
    if (!iso) return "-";
    const [year, month, day] = iso.slice(0, 10).split("-");
    return `${day}/${month}/${year}`;
};

const formatDateTime = (iso?: string | null) => {
    if (!iso) return "-";
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return formatDate(iso);
    return date.toLocaleString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const DetailRow = ({ label, value }: { label: string; value: string }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
        <Text variant="p" color="secondary">
            {label}
        </Text>
        <Text variant="p" color="primary">
            {value}
        </Text>
    </div>
);

export default function Show({ game }: Props) {
    const existingResult = game.match_result;

    const rosterFor = (teamId?: number) =>
        game.rosters?.find((roster) => roster.team_id === teamId);

    return (
        <AuthenticatedLayout
            header={
                <Text variant="h2" color="primary">
                    Detalle del Partido
                </Text>
            }
        >
            <Head title="Detalle del Partido" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-md border-t-4 border-yellow-400 sm:rounded-lg">
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-8">
                                <Link
                                    href={
                                        game.fixture
                                            ? `/fixtures/${game.fixture.id}`
                                            : "/fixtures"
                                    }
                                >
                                    <Button variant="secondary" size="sm">
                                        <Icon name="chevronLeft" size="sm" /> Volver
                                    </Button>
                                </Link>
                                <div className="flex items-center gap-2">
                                    <Link href={`/games/${game.id}/planilla`}>
                                        <Button variant="primary" size="md">
                                            Planilla
                                        </Button>
                                    </Link>
                                    <Link href={`/games/${game.id}/edit`}>
                                        <Button variant="secondary" size="md">
                                            Editar
                                        </Button>
                                    </Link>
                                    <Button
                                        variant="danger"
                                        size="md"
                                        onClick={() => {
                                            if (
                                                confirm(
                                                    "¿Estás seguro de que deseas eliminar este partido?"
                                                )
                                            ) {
                                                router.delete(
                                                    `/games/${game.id}`
                                                );
                                            }
                                        }}
                                    >
                                        Eliminar
                                    </Button>
                                </div>
                            </div>

                            <div className="max-w-xl mx-auto">
                                <div className="text-center mb-8">
                                    <Text variant="h3" color="primary">
                                        {game.team_local?.name_team || "-"} vs{" "}
                                        {game.team_visitor?.name_team || "-"}
                                    </Text>
                                </div>

                                <div className="rounded-lg border border-gray-200 p-6">
                                    <DetailRow
                                        label="Torneo"
                                        value={game.tournament?.name_tournament || "-"}
                                    />
                                    <DetailRow
                                        label="Árbitro"
                                        value={game.referee?.name_referee || "-"}
                                    />
                                    <DetailRow
                                        label="Fecha"
                                        value={formatDate(game.date)}
                                    />
                                    {game.day && (
                                        <DetailRow
                                            label="Día"
                                            value={game.day}
                                        />
                                    )}
                                    <DetailRow
                                        label="Hora"
                                        value={game.time ? game.time.slice(0, 5) : "-"}
                                    />
                                    <DetailRow
                                        label="Estado"
                                        value={game.status_game}
                                    />
                                </div>

                                <div className="mt-8 rounded-lg border border-gray-200 p-6">
                                    <div className="mb-5 text-center">
                                        <Text variant="h3" color="primary">
                                            Lista de buena fe
                                        </Text>
                                    </div>

                                    <div className="space-y-3">
                                        {[
                                            { team: game.team_local, side: "Local" },
                                            { team: game.team_visitor, side: "Visitante" },
                                        ].map(({ team, side }) => {
                                            if (!team) return null;
                                            const roster = rosterFor(team.id);

                                            return (
                                                <div
                                                    key={team.id}
                                                    className="flex items-center justify-between rounded-md border border-gray-100 px-4 py-3"
                                                >
                                                    <div>
                                                        <Text
                                                            variant="p"
                                                            color="primary"
                                                        >
                                                            {side}:{" "}
                                                            {team.name_team}
                                                        </Text>
                                                        {roster ? (
                                                            <Text
                                                                variant="p"
                                                                color="secondary"
                                                            >
                                                                {roster.players_count} convocadas — presentada{" "}
                                                                {formatDateTime(
                                                                    roster.submitted_at
                                                                )}
                                                            </Text>
                                                        ) : (
                                                            <Text
                                                                variant="p"
                                                                color="secondary"
                                                            >
                                                                Todavía no
                                                                presentada
                                                            </Text>
                                                        )}
                                                    </div>
                                                    <Link
                                                        href={`/games/${game.id}/lista/${team.id}`}
                                                    >
                                                        <Button
                                                            variant="secondary"
                                                            size="sm"
                                                        >
                                                            {roster
                                                                ? "Ver / editar"
                                                                : "Cargar lista"}
                                                        </Button>
                                                    </Link>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="mt-8 rounded-lg border border-gray-200 p-6">
                                    <div className="mb-5 text-center">
                                        <Text variant="h3" color="primary">
                                            {existingResult
                                                ? `${game.team_local?.name_team || "Local"} ${existingResult.sets_local}–${existingResult.sets_visitor} ${game.team_visitor?.name_team || "Visitante"}`
                                                : "Sin resultado cargado"}
                                        </Text>
                                    </div>

                                    {existingResult ? (
                                        <div className="overflow-x-auto">
                                            <table className="w-full border-collapse text-center">
                                                <thead>
                                                    <tr className="border-b border-gray-200 text-sm text-gray-600">
                                                        <th className="px-3 py-2 text-left font-medium">
                                                            Set
                                                        </th>
                                                        <th className="px-3 py-2 font-medium">
                                                            {game.team_local?.name_team ||
                                                                "Local"}
                                                        </th>
                                                        <th className="px-3 py-2 font-medium">
                                                            {game.team_visitor?.name_team ||
                                                                "Visitante"}
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="text-sm text-gray-800">
                                                    <tr className="border-b border-gray-100">
                                                        <th className="px-3 py-2 text-left font-medium">
                                                            1
                                                        </th>
                                                        <td className="px-3 py-2">
                                                            {
                                                                existingResult.set_1_points_local
                                                            }
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            {
                                                                existingResult.set_1_points_visitor
                                                            }
                                                        </td>
                                                    </tr>
                                                    <tr className="border-b border-gray-100">
                                                        <th className="px-3 py-2 text-left font-medium">
                                                            2
                                                        </th>
                                                        <td className="px-3 py-2">
                                                            {
                                                                existingResult.set_2_points_local
                                                            }
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            {
                                                                existingResult.set_2_points_visitor
                                                            }
                                                        </td>
                                                    </tr>
                                                    {existingResult.set_3_points_local !==
                                                        null &&
                                                        existingResult.set_3_points_visitor !==
                                                            null && (
                                                            <tr>
                                                                <th className="px-3 py-2 text-left font-medium">
                                                                    3
                                                                </th>
                                                                <td className="px-3 py-2">
                                                                    {
                                                                        existingResult.set_3_points_local
                                                                    }
                                                                </td>
                                                                <td className="px-3 py-2">
                                                                    {
                                                                        existingResult.set_3_points_visitor
                                                                    }
                                                                </td>
                                                            </tr>
                                                        )}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <p className="text-center text-sm text-gray-500">
                                            La planilla todavía no tiene resultado
                                            cargado.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
