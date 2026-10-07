import React from "react";
import { Link, Head, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Button, Text, Icon, Label } from "@/Components/Atoms";
import FormErrors from "@/Components/FormErrors";

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
    day?: string | null;
    tournament?: Tournament;
    team_local?: Team;
    team_visitor?: Team;
}

interface RosterPlayer {
    player_id: number;
    name_player: string;
    dni_player: string;
    birthdate_player: string | null;
    convocada: boolean;
}

interface Props {
    game: Game;
    team: Team;
    players: RosterPlayer[];
    submittedAt: string | null;
    isLocked: boolean;
}

const formatDate = (iso?: string | null) => {
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

export default function Roster({
    game,
    team,
    players,
    submittedAt,
    isLocked,
}: Props) {
    const [roster, setRoster] = React.useState<RosterPlayer[]>(players);

    const convocadas = roster.filter((player) => player.convocada).length;

    const toggle = (playerId: number) => {
        if (isLocked) return;

        setRoster((current) =>
            current.map((player) =>
                player.player_id === playerId
                    ? { ...player, convocada: !player.convocada }
                    : player
            )
        );
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        router.put(
            `/games/${game.id}/lista/${team.id}`,
            {
                players: roster
                    .filter((player) => player.convocada)
                    .map((player) => player.player_id),
            },
            { preserveScroll: true }
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <Text variant="h2" color="primary">
                    Lista de buena fe
                </Text>
            }
        >
            <Head title={`Lista de buena fe - ${team.name_team}`} />

            <div className="py-12">
                <div className="mx-auto max-w-5xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-md border-t-4 border-yellow-400 sm:rounded-lg">
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-8">
                                <Link href={`/games/${game.id}`}>
                                    <Button variant="secondary" size="sm">
                                        <Icon name="chevronLeft" size="sm" />{" "}
                                        Volver
                                    </Button>
                                </Link>
                                {isLocked ? (
                                    <span className="rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700">
                                        Lista cerrada
                                    </span>
                                ) : (
                                    <span className="rounded-md bg-yellow-50 px-3 py-2 text-sm font-medium text-yellow-700">
                                        Se puede modificar hasta que empiece el
                                        partido
                                    </span>
                                )}
                            </div>

                            <FormErrors />

                            <div className="text-center mb-6">
                                <Text variant="h3" color="primary">
                                    {team.name_team}
                                </Text>
                                <Text variant="p" color="secondary">
                                    {game.team_local?.name_team || "-"} vs{" "}
                                    {game.team_visitor?.name_team || "-"}
                                </Text>
                            </div>

                            <dl className="grid gap-5 sm:grid-cols-3 mb-8 rounded-lg border border-gray-200 p-6">
                                <div>
                                    <dt className="text-xs font-semibold text-gray-500 uppercase">
                                        Torneo
                                    </dt>
                                    <dd className="text-sm text-gray-700">
                                        {game.tournament?.name_tournament || "-"}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-xs font-semibold text-gray-500 uppercase">
                                        Fecha
                                    </dt>
                                    <dd className="text-sm text-gray-700">
                                        {formatDate(game.date)}
                                        {game.day ? ` (${game.day})` : ""}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-xs font-semibold text-gray-500 uppercase">
                                        Hora
                                    </dt>
                                    <dd className="text-sm text-gray-700">
                                        {game.time ? game.time.slice(0, 5) : "-"}
                                    </dd>
                                </div>
                            </dl>

                            <div className="mb-4 flex items-center justify-between">
                                <Label
                                    text={`Convocatoria (${convocadas})`}
                                    htmlFor="players"
                                />
                                {submittedAt && (
                                    <Text variant="p" color="secondary">
                                        Última presentación:{" "}
                                        {formatDateTime(submittedAt)}
                                    </Text>
                                )}
                            </div>

                            <form
                                onSubmit={handleSubmit}
                                className="space-y-6"
                            >
                                <div className="overflow-x-auto rounded-lg border border-gray-200">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    Nombre y apellido
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    DNI
                                                </th>
                                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    Convocada
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {roster.map((player) => (
                                                <tr
                                                    key={player.player_id}
                                                    className="hover:bg-gray-50"
                                                >
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 font-medium">
                                                        {player.name_player}
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                                                        {player.dni_player}
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={
                                                                player.convocada
                                                            }
                                                            disabled={isLocked}
                                                            onChange={() =>
                                                                toggle(
                                                                    player.player_id
                                                                )
                                                            }
                                                            className="h-4 w-4 rounded border-gray-300 text-yellow-500 focus:ring-yellow-400 disabled:opacity-50"
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    {roster.length === 0 && (
                                        <p className="py-6 text-center text-sm text-gray-500">
                                            Este equipo no tiene jugadoras
                                            registradas.
                                        </p>
                                    )}
                                </div>

                                {!isLocked && (
                                    <div className="flex justify-end">
                                        <Button variant="primary" type="submit">
                                            Guardar lista
                                        </Button>
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
