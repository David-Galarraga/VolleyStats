import React from "react";
import { Link, Head, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Button, Text, Icon, Input, Label } from "@/Components/Atoms";
import FormErrors from "@/Components/FormErrors";

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

interface Game {
    id: number;
    date: string;
    time: string;
    status_game: string;
    day?: string | null;
    tournament?: Tournament;
    team_local?: Team;
    team_visitor?: Team;
    referee?: Referee;
    match_result?: MatchResult | null;
}

interface Sheet {
    id: number;
    status_sheet: string;
    venue: string | null;
    observations: string | null;
    closed_at: string | null;
}

interface SheetPlayer {
    player_id: number;
    name_player: string;
    dni_player: string;
    birthdate_player: string | null;
    present: boolean;
}

interface Props {
    game: Game;
    sheet: Sheet | null;
    localPlayers: SheetPlayer[];
    visitorPlayers: SheetPlayer[];
    rostersReady: boolean;
}

const formatDate = (iso?: string | null) => {
    if (!iso) return "-";
    const [year, month, day] = iso.slice(0, 10).split("-");
    return `${day}/${month}/${year}`;
};

const toggle = (list: SheetPlayer[], playerId: number): SheetPlayer[] =>
    list.map((player) =>
        player.player_id === playerId
            ? { ...player, present: !player.present }
            : player
    );

const PlayersTable = ({
    title,
    teamName,
    players,
    disabled,
    onToggle,
}: {
    title: string;
    teamName: string;
    players: SheetPlayer[];
    disabled: boolean;
    onToggle: (playerId: number) => void;
}) => (
    <div className="rounded-lg border border-gray-200 p-6">
        <Text variant="h3" color="primary">
            {title} — {teamName}
        </Text>
        <div className="mt-4 overflow-x-auto">
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
                            Presente
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {players.map((player) => (
                        <tr key={player.player_id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 font-medium">
                                {player.name_player}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                                {player.dni_player}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-center">
                                <input
                                    type="checkbox"
                                    checked={player.present}
                                    disabled={disabled}
                                    onChange={() =>
                                        onToggle(player.player_id)
                                    }
                                    className="h-4 w-4 rounded border-gray-300 text-yellow-500 focus:ring-yellow-400 disabled:opacity-50"
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {players.length === 0 && (
                <p className="py-6 text-center text-sm text-gray-500">
                    Este equipo no tiene jugadoras en su lista de buena fe.
                </p>
            )}
        </div>
    </div>
);

export default function Scoresheet({
    game,
    sheet,
    localPlayers,
    visitorPlayers,
    rostersReady,
}: Props) {
    const isClosed = !!sheet && sheet.status_sheet !== "draft";
    const existingResult = game.match_result;

    const [venue, setVenue] = React.useState(sheet?.venue ?? "");
    const [observations, setObservations] = React.useState(
        sheet?.observations ?? ""
    );
    const [local, setLocal] = React.useState<SheetPlayer[]>(localPlayers);
    const [visitor, setVisitor] =
        React.useState<SheetPlayer[]>(visitorPlayers);

    const [generalScore, setGeneralScore] = React.useState(
        existingResult
            ? `${existingResult.sets_local}-${existingResult.sets_visitor}`
            : ""
    );
    const [points, setPoints] = React.useState({
        set_1_points_local: existingResult?.set_1_points_local?.toString() ?? "",
        set_1_points_visitor:
            existingResult?.set_1_points_visitor?.toString() ?? "",
        set_2_points_local: existingResult?.set_2_points_local?.toString() ?? "",
        set_2_points_visitor:
            existingResult?.set_2_points_visitor?.toString() ?? "",
        set_3_points_local: existingResult?.set_3_points_local?.toString() ?? "",
        set_3_points_visitor:
            existingResult?.set_3_points_visitor?.toString() ?? "",
    });
    const thirdSetIsRequired = ["2-1", "1-2"].includes(generalScore);

    const updatePoints = (field: keyof typeof points, value: string) => {
        setPoints((current) => ({ ...current, [field]: value }));
    };

    const handleSheetSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        router.put(
            `/games/${game.id}/planilla`,
            {
                venue,
                observations,
                players: [...local, ...visitor].map((player) => ({
                    player_id: player.player_id,
                    present: player.present,
                })),
            },
            { preserveScroll: true }
        );
    };

    const handleResultSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!generalScore) return;

        const [setsLocal, setsVisitor] = generalScore.split("-").map(Number);
        router.put(
            `/games/${game.id}/result`,
            {
                sets_local: setsLocal,
                sets_visitor: setsVisitor,
                set_1_points_local: points.set_1_points_local,
                set_1_points_visitor: points.set_1_points_visitor,
                set_2_points_local: points.set_2_points_local,
                set_2_points_visitor: points.set_2_points_visitor,
                set_3_points_local: thirdSetIsRequired
                    ? points.set_3_points_local
                    : null,
                set_3_points_visitor: thirdSetIsRequired
                    ? points.set_3_points_visitor
                    : null,
            },
            { preserveScroll: true }
        );
    };

    const handleClose = () => {
        if (
            confirm(
                "¿Cerrar la planilla? Una vez cerrada no se podrá modificar y el partido quedará finalizado."
            )
        ) {
            router.post(`/games/${game.id}/planilla/close`);
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <Text variant="h2" color="primary">
                    Planilla de partido
                </Text>
            }
        >
            <Head title="Planilla de partido" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-md border-t-4 border-yellow-400 sm:rounded-lg">
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-8">
                                <Link href={`/games/${game.id}`}>
                                    <Button variant="secondary" size="sm">
                                        <Icon name="chevronLeft" size="sm" />{" "}
                                        Volver
                                    </Button>
                                </Link>
                                {!isClosed ? (
                                    <Button
                                        variant="primary"
                                        size="md"
                                        onClick={handleClose}
                                    >
                                        Cerrar planilla
                                    </Button>
                                ) : (
                                    <span className="rounded-md bg-green-50 px-3 py-2 text-sm font-medium text-green-700">
                                        Planilla cerrada
                                    </span>
                                )}
                            </div>

                            <FormErrors />

                            {!isClosed && !rostersReady && (
                                <div className="mb-6 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                                    La lista de buena fe de ambos equipos
                                    todavía no está presentada. Cargala desde el
                                    detalle del partido antes de registrar la
                                    asistencia.
                                </div>
                            )}

                            <div className="text-center mb-8">
                                <Text variant="h3" color="primary">
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
                                <div>
                                    <dt className="text-xs font-semibold text-gray-500 uppercase">
                                        Árbitro
                                    </dt>
                                    <dd className="text-sm text-gray-700">
                                        {game.referee?.name_referee || "-"}
                                    </dd>
                                </div>
                                <div className="sm:col-span-2">
                                    <Label text="Cancha / sede" htmlFor="venue" />
                                    <div className="mt-1">
                                        <Input
                                            id="venue"
                                            type="text"
                                            value={venue}
                                            disabled={isClosed}
                                            onChange={(event) =>
                                                setVenue(event.target.value)
                                            }
                                            placeholder="Ingrese la cancha o sede"
                                        />
                                    </div>
                                </div>
                            </dl>

                            <form onSubmit={handleSheetSubmit} className="space-y-6">
                                <PlayersTable
                                    title="Local"
                                    teamName={game.team_local?.name_team || "-"}
                                    players={local}
                                    disabled={isClosed}
                                    onToggle={(playerId) =>
                                        setLocal((current) =>
                                            toggle(current, playerId)
                                        )
                                    }
                                />
                                <PlayersTable
                                    title="Visitante"
                                    teamName={game.team_visitor?.name_team || "-"}
                                    players={visitor}
                                    disabled={isClosed}
                                    onToggle={(playerId) =>
                                        setVisitor((current) =>
                                            toggle(current, playerId)
                                        )
                                    }
                                />

                                <div>
                                    <Label
                                        text="Observaciones"
                                        htmlFor="observations"
                                    />
                                    <div className="mt-1">
                                        <textarea
                                            id="observations"
                                            value={observations}
                                            disabled={isClosed}
                                            onChange={(event) =>
                                                setObservations(event.target.value)
                                            }
                                            rows={3}
                                            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400 disabled:bg-gray-100"
                                        />
                                    </div>
                                </div>

                                {!isClosed && (
                                    <div className="flex justify-end">
                                        <Button
                                            variant="primary"
                                            type="submit"
                                            disabled={!rostersReady}
                                        >
                                            Guardar asistencia
                                        </Button>
                                    </div>
                                )}
                            </form>

                            <div className="mt-8 rounded-lg border border-gray-200 p-6">
                                <div className="mb-5 text-center">
                                    <Text variant="h3" color="primary">
                                        {existingResult
                                            ? `${game.team_local?.name_team || "Local"} ${existingResult.sets_local}–${existingResult.sets_visitor} ${game.team_visitor?.name_team || "Visitante"}`
                                            : "Cargar resultado"}
                                    </Text>
                                </div>

                                {existingResult && (
                                    <div className="mb-6 overflow-x-auto">
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
                                )}

                                {!isClosed && (
                                    <form
                                        onSubmit={handleResultSubmit}
                                        className="space-y-5"
                                    >
                                        <div>
                                            <Label
                                                text="Resultado general en sets"
                                                htmlFor="general_score"
                                            />
                                            <select
                                                id="general_score"
                                                value={generalScore}
                                                onChange={(event) =>
                                                    setGeneralScore(
                                                        event.target.value
                                                    )
                                                }
                                                required
                                                className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400"
                                            >
                                                <option value="">
                                                    Seleccioná el resultado
                                                </option>
                                                <option value="2-0">
                                                    Local 2–0
                                                </option>
                                                <option value="2-1">
                                                    Local 2–1
                                                </option>
                                                <option value="0-2">
                                                    Visitante 2–0
                                                </option>
                                                <option value="1-2">
                                                    Visitante 2–1
                                                </option>
                                            </select>
                                        </div>

                                        <div className="grid grid-cols-3 items-end gap-3">
                                            <span className="text-sm font-medium text-gray-600">
                                                Set
                                            </span>
                                            <span className="text-center text-sm font-medium text-gray-600">
                                                {game.team_local?.name_team ||
                                                    "Local"}
                                            </span>
                                            <span className="text-center text-sm font-medium text-gray-600">
                                                {game.team_visitor?.name_team ||
                                                    "Visitante"}
                                            </span>
                                            {([
                                                [
                                                    1,
                                                    "set_1_points_local",
                                                    "set_1_points_visitor",
                                                ],
                                                [
                                                    2,
                                                    "set_2_points_local",
                                                    "set_2_points_visitor",
                                                ],
                                            ] as const).map(
                                                ([
                                                    setNumber,
                                                    localField,
                                                    visitorField,
                                                ]) => (
                                                    <React.Fragment
                                                        key={setNumber}
                                                    >
                                                        <span className="text-sm text-gray-700">
                                                            Set {setNumber}
                                                        </span>
                                                        <Input
                                                            id={localField}
                                                            type="number"
                                                            min="0"
                                                            required
                                                            value={
                                                                points[localField]
                                                            }
                                                            onChange={(event) =>
                                                                updatePoints(
                                                                    localField,
                                                                    event.target
                                                                        .value
                                                                )
                                                            }
                                                        />
                                                        <Input
                                                            id={visitorField}
                                                            type="number"
                                                            min="0"
                                                            required
                                                            value={
                                                                points[
                                                                    visitorField
                                                                ]
                                                            }
                                                            onChange={(event) =>
                                                                updatePoints(
                                                                    visitorField,
                                                                    event.target
                                                                        .value
                                                                )
                                                            }
                                                        />
                                                    </React.Fragment>
                                                )
                                            )}

                                            {thirdSetIsRequired && (
                                                <>
                                                    <span className="text-sm text-gray-700">
                                                        Set 3
                                                    </span>
                                                    <Input
                                                        id="set_3_points_local"
                                                        type="number"
                                                        min="0"
                                                        required
                                                        value={
                                                            points.set_3_points_local
                                                        }
                                                        onChange={(event) =>
                                                            updatePoints(
                                                                "set_3_points_local",
                                                                event.target.value
                                                            )
                                                        }
                                                    />
                                                    <Input
                                                        id="set_3_points_visitor"
                                                        type="number"
                                                        min="0"
                                                        required
                                                        value={
                                                            points.set_3_points_visitor
                                                        }
                                                        onChange={(event) =>
                                                            updatePoints(
                                                                "set_3_points_visitor",
                                                                event.target.value
                                                            )
                                                        }
                                                    />
                                                </>
                                            )}
                                        </div>

                                        <div className="flex justify-end">
                                            <Button variant="primary" type="submit">
                                                {existingResult
                                                    ? "Guardar cambios del resultado"
                                                    : "Guardar resultado"}
                                            </Button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
