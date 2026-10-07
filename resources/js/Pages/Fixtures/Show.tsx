import React from "react";
import { Link, Head } from "@inertiajs/react";
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

interface Availability {
    id: number;
    id_team: number;
    date: string;
    start_time: string;
    end_time: string;
    team?: Team;
}

interface Game {
    id: number;
    id_fixture: number | null;
    date: string;
    time: string;
    status_game: string;
    set_local: number | null;
    set_visitor: number | null;
    result: string;
    day?: string | null;
    team_local?: Team;
    team_visitor?: Team;
    referee?: Referee;
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
    availabilities: Availability[];
}

interface Props {
    fixture: Fixture;
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

const dayLabel = (date: string, fixture: Fixture) => {
    const normalized = date.slice(0, 10);
    if (normalized === fixture.start_date.slice(0, 10)) return "Sábado";
    if (normalized === fixture.end_date.slice(0, 10)) return "Domingo";
    return `Fuera del fixture (${formatDate(date)})`;
};

const sortByTime = (games: Game[]) =>
    [...games].sort((a, b) => (a.time || "").localeCompare(b.time || ""));

const GamesTable = ({ games }: { games: Game[] }) => (
    <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Local
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Visitante
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Árbitro
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Hora
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Resultado
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Acciones
                    </th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {games.map((game) => (
                    <tr
                        key={game.id}
                        className="hover:bg-gray-50 transition-colors"
                    >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                            {game.team_local?.name_team || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {game.team_visitor?.name_team || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {game.referee?.name_referee || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {game.time ? game.time.slice(0, 5) : "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {game.result}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-2">
                                <Link href={`/games/${game.id}`}>
                                    <Button variant="secondary" size="sm">
                                        Ver
                                    </Button>
                                </Link>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

export default function Show({ fixture }: Props) {
    // Fuente de verdad: Game::getDayAttribute() (backend). El fallback solo
    // normaliza formatos ISO vs Y-m-d para no duplicar la regla sábado/domingo.
    const resolveDay = (game: Game) => {
        if (game.day) return game.day;
        const gameDate = game.date.slice(0, 10);
        if (gameDate === fixture.start_date.slice(0, 10)) return "sábado";
        if (gameDate === fixture.end_date.slice(0, 10)) return "domingo";
        return null;
    };

    const saturdayGames = sortByTime(
        fixture.games.filter((game) => resolveDay(game) === "sábado")
    );
    const sundayGames = sortByTime(
        fixture.games.filter((game) => resolveDay(game) === "domingo")
    );
    const otherGames = sortByTime(
        fixture.games.filter((game) => !resolveDay(game))
    );

    const availabilitiesByDay = React.useMemo(() => {
        const groups = [
            { date: fixture.start_date, items: [] as Availability[] },
            { date: fixture.end_date, items: [] as Availability[] },
        ];
        const outside: Availability[] = [];
        [...fixture.availabilities]
            .sort((a, b) =>
                a.date === b.date
                    ? a.start_time.localeCompare(b.start_time)
                    : a.date.localeCompare(b.date)
            )
            .forEach((a) => {
                const group = groups.find((g) => g.date === a.date);
                if (group) group.items.push(a);
                else outside.push(a);
            });
        return { groups, outside };
    }, [fixture.availabilities, fixture.start_date, fixture.end_date]);

    return (
        <AuthenticatedLayout
            header={
                <Text variant="h2" color="primary">
                    {fixture.name_fixture}
                </Text>
            }
        >
            <Head title={fixture.name_fixture} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-md border-t-4 border-yellow-400 sm:rounded-lg">
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-8">
                                <Link href="/fixtures">
                                    <Button variant="secondary" size="sm">
                                        <Icon name="chevronLeft" size="sm" />{" "}
                                        Volver
                                    </Button>
                                </Link>
                                <div className="flex items-center gap-2">
                                    <Link
                                        href={`/fixtures/${fixture.id}/availabilities`}
                                    >
                                        <Button variant="secondary" size="md">
                                            Gestionar disponibilidad
                                        </Button>
                                    </Link>
                                    <Link
                                        href={`/games/create?fixture=${fixture.id}`}
                                    >
                                        <Button variant="primary" size="md">
                                            Nuevo partido
                                        </Button>
                                    </Link>
                                </div>
                            </div>

                            <dl className="grid grid-cols-2 gap-6 mb-8 max-w-xl">
                                <div>
                                    <dt className="text-xs font-semibold text-gray-500 uppercase">
                                        Torneo
                                    </dt>
                                    <dd className="text-sm text-gray-700">
                                        {fixture.tournament?.name_tournament ||
                                            "-"}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-xs font-semibold text-gray-500 uppercase">
                                        Estado
                                    </dt>
                                    <dd className="text-sm text-gray-700">
                                        {statusLabels[
                                            fixture.status_fixture
                                        ] ||
                                            fixture.status_fixture ||
                                            "-"}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-xs font-semibold text-gray-500 uppercase">
                                        Sábado
                                    </dt>
                                    <dd className="text-sm text-gray-700">
                                        {formatDate(fixture.start_date)}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-xs font-semibold text-gray-500 uppercase">
                                        Domingo
                                    </dt>
                                    <dd className="text-sm text-gray-700">
                                        {formatDate(fixture.end_date)}
                                    </dd>
                                </div>
                            </dl>

                            <div className="mb-10">
                                <Text variant="h3" color="primary">
                                    Disponibilidad de equipos
                                </Text>
                                {fixture.availabilities.length > 0 ? (
                                    <div className="mt-3 space-y-4">
                                        {availabilitiesByDay.groups.map(
                                            (group) => (
                                                <div key={group.date}>
                                                    <p className="text-sm font-semibold text-gray-600">
                                                        {dayLabel(
                                                            group.date,
                                                            fixture
                                                        )}{" "}
                                                        —{" "}
                                                        {formatDate(group.date)}
                                                    </p>
                                                    {group.items.length > 0 ? (
                                                        <ul className="mt-1 space-y-1 text-sm text-gray-700">
                                                            {group.items.map(
                                                                (a) => (
                                                                    <li
                                                                        key={
                                                                            a.id
                                                                        }
                                                                    >
                                                                        <span className="font-medium">
                                                                            {a.team
                                                                                ?.name_team ||
                                                                                "-"}
                                                                        </span>
                                                                        {" — "}
                                                                        {a.start_time.slice(
                                                                            0,
                                                                            5
                                                                        )}
                                                                        –
                                                                        {a.end_time.slice(
                                                                            0,
                                                                            5
                                                                        )}
                                                                    </li>
                                                                )
                                                            )}
                                                        </ul>
                                                    ) : (
                                                        <p className="mt-1 text-sm text-gray-500">
                                                            Sin franjas.
                                                        </p>
                                                    )}
                                                </div>
                                            )
                                        )}
                                        {availabilitiesByDay.outside.length >
                                            0 && (
                                            <div>
                                                <p className="text-sm font-semibold text-amber-700">
                                                    Fuera del fixture
                                                </p>
                                                <ul className="mt-1 space-y-1 text-sm text-gray-700">
                                                    {availabilitiesByDay.outside.map(
                                                        (a) => (
                                                            <li key={a.id}>
                                                                <span className="font-medium">
                                                                    {a.team
                                                                        ?.name_team ||
                                                                        "-"}
                                                                </span>
                                                                {" — "}
                                                                {formatDate(
                                                                    a.date
                                                                )}{" "}
                                                                {a.start_time.slice(
                                                                    0,
                                                                    5
                                                                )}
                                                                –
                                                                {a.end_time.slice(
                                                                    0,
                                                                    5
                                                                )}
                                                            </li>
                                                        )
                                                    )}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <Text
                                        variant="p"
                                        color="secondary"
                                        className="mt-3"
                                    >
                                        Sin disponibilidad registrada.
                                    </Text>
                                )}
                            </div>

                            <div className="space-y-10">
                                <section>
                                    <Text variant="h3" color="primary">
                                        Sábado{" "}
                                        {formatDate(fixture.start_date)}
                                    </Text>
                                    <div className="mt-4">
                                        {saturdayGames.length > 0 ? (
                                            <GamesTable games={saturdayGames} />
                                        ) : (
                                            <Text
                                                variant="p"
                                                color="secondary"
                                            >
                                                Sin partidos el sábado.
                                            </Text>
                                        )}
                                    </div>
                                </section>

                                <section>
                                    <Text variant="h3" color="primary">
                                        Domingo{" "}
                                        {formatDate(fixture.end_date)}
                                    </Text>
                                    <div className="mt-4">
                                        {sundayGames.length > 0 ? (
                                            <GamesTable games={sundayGames} />
                                        ) : (
                                            <Text
                                                variant="p"
                                                color="secondary"
                                            >
                                                Sin partidos el domingo.
                                            </Text>
                                        )}
                                    </div>
                                </section>

                                {otherGames.length > 0 && (
                                    <section>
                                        <Text variant="h3" color="primary">
                                            Fuera del fin de semana (revisar)
                                        </Text>
                                        <p className="mt-2 text-sm text-amber-700">
                                            Estos partidos tienen una fecha
                                            distinta al sábado/domingo del
                                            fixture. Suele ocurrir si se
                                            cambiaron las fechas del fixture
                                            después de crearlos.
                                        </p>
                                        <div className="mt-4">
                                            <GamesTable games={otherGames} />
                                        </div>
                                    </section>
                                )}
                            </div>

                            {fixture.games.length === 0 && (
                                <div className="text-center py-8">
                                    <Text variant="p" color="secondary">
                                        Este fixture todavía no tiene partidos.
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
