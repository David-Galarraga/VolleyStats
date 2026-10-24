import React from "react";
import { Link, Head, router, usePage } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Button, Text, Icon, Input, Label } from "@/Components/Atoms";
import FormErrors from "@/Components/FormErrors";
import { PageProps } from "@/types";

interface Tournament {
    id: number;
    name_tournament: string;
}

interface Team {
    id: number;
    name_team: string;
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
    match_result?: MatchResult | null;
}

interface Sheet {
    id: number;
    status_sheet: string;
    venue: string | null;
    referee_name: string | null;
    scorekeeper_name: string | null;
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

type ActionFeedback = {
    type: "pending" | "success" | "error";
    message: string;
};

type VisitOptions = NonNullable<Parameters<typeof router.put>[2]> & {
    onHttpException?: (response: { status: number }) => void;
    onNetworkError?: () => void;
};

const FeedbackMessage = ({ feedback }: { feedback: ActionFeedback | null }) => {
    if (!feedback) return null;

    const colors = {
        pending: "border-blue-200 bg-blue-50 text-blue-800",
        success: "border-green-200 bg-green-50 text-green-800",
        error: "border-red-200 bg-red-50 text-red-800",
    };

    return (
        <div
            role={feedback.type === "error" ? "alert" : "status"}
            aria-live="polite"
            className={`rounded-md border px-4 py-3 text-sm ${colors[feedback.type]}`}
        >
            {feedback.message}
        </div>
    );
};

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
}: Props) {
    const user = usePage<PageProps>().props.auth.user;
    const backHref = user.roles?.includes("Administrador")
        ? `/games/${game.id}`
        : route("my-sheets.index");
    const isClosed = !!sheet && sheet.status_sheet !== "draft";
    const existingResult = game.match_result;

    const [venue, setVenue] = React.useState(sheet?.venue ?? "");
    const [refereeName, setRefereeName] = React.useState(sheet?.referee_name ?? "");
    const [scorekeeperName, setScorekeeperName] = React.useState(sheet?.scorekeeper_name ?? "");
    const [observations, setObservations] = React.useState(
        sheet?.observations ?? ""
    );
    const [local, setLocal] = React.useState<SheetPlayer[]>(localPlayers);
    const [visitor, setVisitor] =
        React.useState<SheetPlayer[]>(visitorPlayers);
    const [activeRoster, setActiveRoster] = React.useState<"local" | "visitor" | null>(null);

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
    const currentSheetState = JSON.stringify({
        venue,
        refereeName,
        scorekeeperName,
        observations,
        players: [...local, ...visitor].map(({ player_id, present }) => ({ player_id, present })),
    });
    const [savedSheetState, setSavedSheetState] = React.useState(currentSheetState);
    const currentResultState = JSON.stringify({ generalScore, points });
    const [savedResultState, setSavedResultState] = React.useState(currentResultState);
    const hasUnsavedChanges = !sheet
        || currentSheetState !== savedSheetState
        || currentResultState !== savedResultState;
    const [sheetFeedback, setSheetFeedback] = React.useState<ActionFeedback | null>(null);
    const [resultFeedback, setResultFeedback] = React.useState<ActionFeedback | null>(null);
    const [closeFeedback, setCloseFeedback] = React.useState<ActionFeedback | null>(null);
    const [isClosing, setIsClosing] = React.useState(false);
    const thirdSetIsRequired = ["2-1", "1-2"].includes(generalScore);

    React.useEffect(() => {
        if (currentSheetState !== savedSheetState && sheetFeedback?.type === "success") {
            setSheetFeedback(null);
        }
    }, [currentSheetState, savedSheetState, sheetFeedback?.type]);

    React.useEffect(() => {
        if (currentResultState !== savedResultState && resultFeedback?.type === "success") {
            setResultFeedback(null);
        }
    }, [currentResultState, savedResultState, resultFeedback?.type]);

    const updatePoints = (field: keyof typeof points, value: string) => {
        setPoints((current) => ({ ...current, [field]: value }));
    };

    const handleSheetSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        saveSheet();
    };

    const saveSheet = (afterSuccess?: () => void, partOfClose = false) => {
        const payload = {
            venue,
            referee_name: refereeName,
            scorekeeper_name: scorekeeperName,
            observations,
            players: [...local, ...visitor].map(({ player_id, present }) => ({ player_id, present })),
        };
        const submittedState = JSON.stringify({
            venue,
            refereeName,
            scorekeeperName,
            observations,
            players: payload.players,
        });

        router.put(`/games/${game.id}/planilla`, payload, {
            preserveScroll: true,
            onStart: () => {
                setSheetFeedback({ type: "pending", message: "Guardando asistencia…" });
                if (partOfClose) setCloseFeedback({ type: "pending", message: "Guardando los cambios de la planilla…" });
            },
            onSuccess: () => {
                setSavedSheetState(submittedState);
                setSheetFeedback({ type: "success", message: "Asistencia guardada correctamente." });
                afterSuccess?.();
            },
            onError: (errors) => {
                const message = Object.values(errors).join(" ") || "No se pudo guardar la asistencia. Revisá los datos e intentá nuevamente.";
                setSheetFeedback({ type: "error", message });
                if (partOfClose) {
                    setCloseFeedback({ type: "error", message: `No se cerró la planilla porque falló el guardado: ${message}` });
                    setIsClosing(false);
                }
            },
            onHttpException: (response) => {
                const message = `El servidor no pudo guardar la planilla (HTTP ${response.status}). Verificá game_sheets.referee_name y game_sheets.scorekeeper_name o revisá el log.`;
                setSheetFeedback({ type: "error", message });
                if (partOfClose) {
                    setCloseFeedback({ type: "error", message });
                    setIsClosing(false);
                }
            },
            onNetworkError: () => {
                const message = "No se pudo conectar con el servidor. La asistencia no se marcó como guardada.";
                setSheetFeedback({ type: "error", message });
                if (partOfClose) {
                    setCloseFeedback({ type: "error", message });
                    setIsClosing(false);
                }
            },
        } as VisitOptions);
    };

    const handleResultSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        saveResult();
    };

    const saveResult = (afterSuccess?: () => void, partOfClose = false) => {
        const requiredPoints = [
            points.set_1_points_local,
            points.set_1_points_visitor,
            points.set_2_points_local,
            points.set_2_points_visitor,
            ...(thirdSetIsRequired ? [points.set_3_points_local, points.set_3_points_visitor] : []),
        ];
        if (!generalScore || requiredPoints.some((value) => value === "")) {
            const message = "Completá el resultado general y los tanteadores requeridos antes de guardar.";
            setResultFeedback({ type: "error", message });
            if (partOfClose) {
                setCloseFeedback({ type: "error", message: `No se cerró la planilla: ${message}` });
                setIsClosing(false);
            }
            return;
        }

        const [setsLocal, setsVisitor] = generalScore.split("-").map(Number);
        const payload = {
            sets_local: setsLocal,
            sets_visitor: setsVisitor,
            set_1_points_local: points.set_1_points_local,
            set_1_points_visitor: points.set_1_points_visitor,
            set_2_points_local: points.set_2_points_local,
            set_2_points_visitor: points.set_2_points_visitor,
            set_3_points_local: thirdSetIsRequired ? points.set_3_points_local : null,
            set_3_points_visitor: thirdSetIsRequired ? points.set_3_points_visitor : null,
        };
        const submittedState = JSON.stringify({ generalScore, points });

        router.put(`/games/${game.id}/result`, payload, {
            preserveScroll: true,
            onStart: () => {
                setResultFeedback({ type: "pending", message: "Guardando resultado…" });
                if (partOfClose) setCloseFeedback({ type: "pending", message: "Guardando los cambios del resultado…" });
            },
            onSuccess: () => {
                setSavedResultState(submittedState);
                setResultFeedback({ type: "success", message: "Resultado guardado correctamente." });
                afterSuccess?.();
            },
            onError: (errors) => {
                const message = Object.values(errors).join(" ") || "No se pudo guardar el resultado. Revisá los datos e intentá nuevamente.";
                setResultFeedback({ type: "error", message });
                if (partOfClose) {
                    setCloseFeedback({ type: "error", message: `No se cerró la planilla porque falló el guardado del resultado: ${message}` });
                    setIsClosing(false);
                }
            },
            onHttpException: (response) => {
                const message = `El servidor no pudo guardar el resultado (HTTP ${response.status}).`;
                setResultFeedback({ type: "error", message });
                if (partOfClose) {
                    setCloseFeedback({ type: "error", message });
                    setIsClosing(false);
                }
            },
            onNetworkError: () => {
                const message = "No se pudo conectar con el servidor. El resultado no se marcó como guardado.";
                setResultFeedback({ type: "error", message });
                if (partOfClose) {
                    setCloseFeedback({ type: "error", message });
                    setIsClosing(false);
                }
            },
        } as VisitOptions);
    };

    const closeSavedPlanilla = () => {
        router.post(`/games/${game.id}/planilla/close`, {}, {
            preserveScroll: true,
            onStart: () => setCloseFeedback({ type: "pending", message: "Cambios guardados. Cerrando planilla…" }),
            onSuccess: () => {
                setCloseFeedback({ type: "success", message: "Planilla cerrada correctamente." });
                setIsClosing(false);
            },
            onError: (errors) => {
                setCloseFeedback({ type: "error", message: Object.values(errors).join(" ") || "No se pudo cerrar la planilla." });
                setIsClosing(false);
            },
            onHttpException: (response) => {
                setCloseFeedback({ type: "error", message: `Los cambios quedaron guardados, pero el cierre falló (HTTP ${response.status}).` });
                setIsClosing(false);
            },
            onNetworkError: () => {
                setCloseFeedback({ type: "error", message: "Los cambios quedaron guardados, pero no se pudo conectar para cerrar la planilla." });
                setIsClosing(false);
            },
        } as VisitOptions);
    };

    const savePendingChangesThenClose = () => {
        if (!sheet || currentSheetState !== savedSheetState) {
            saveSheet(() => {
                if (currentResultState !== savedResultState) {
                    saveResult(closeSavedPlanilla, true);
                } else {
                    closeSavedPlanilla();
                }
            }, true);
            return;
        }

        if (currentResultState !== savedResultState) {
            saveResult(closeSavedPlanilla, true);
            return;
        }

        closeSavedPlanilla();
    };

    const handleClose = () => {
        if (isClosing) return;

        if (confirm("¿Cerrar la planilla? Se guardarán primero los cambios actuales y luego el partido quedará finalizado.")) {
            setIsClosing(true);
            setCloseFeedback({ type: "pending", message: "Preparando el guardado y cierre…" });
            savePendingChangesThenClose();
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
                                <Link href={backHref}>
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
                                        disabled={isClosing}
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
                            <FeedbackMessage feedback={closeFeedback} />
                            <p className={`mt-3 text-sm ${hasUnsavedChanges ? "text-amber-700" : "text-green-700"}`}>
                                {hasUnsavedChanges
                                    ? "Hay cambios pendientes; se guardarán al cerrar la planilla."
                                    : "No hay cambios pendientes de guardar."}
                            </p>

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
                                        <Input id="referee_name" type="text" value={refereeName} disabled={isClosed || isClosing} onChange={(event) => setRefereeName(event.target.value)} placeholder="Nombre del árbitro" />
                                    </dd>
                                </div>
                                <div className="sm:col-span-2">
                                    <Label text="Cancha / sede" htmlFor="venue" />
                                    <div className="mt-1">
                                        <Input
                                            id="venue"
                                            type="text"
                                            value={venue}
                                            disabled={isClosed || isClosing}
                                            onChange={(event) =>
                                                setVenue(event.target.value)
                                            }
                                            placeholder="Ingrese la cancha o sede"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label text="Planillero" htmlFor="scorekeeper_name" />
                                    <div className="mt-1">
                                        <Input id="scorekeeper_name" type="text" value={scorekeeperName} disabled={isClosed || isClosing} onChange={(event) => setScorekeeperName(event.target.value)} placeholder="Nombre del planillero" />
                                    </div>
                                </div>
                            </dl>

                            <form onSubmit={handleSheetSubmit} className="space-y-6">
                                <div className="rounded-lg border border-gray-200 p-6">
                                    <Text variant="h3" color="primary">
                                        Asistencia por equipo
                                    </Text>
                                    <div className="mt-4 flex flex-wrap gap-3">
                                        <Button
                                            type="button"
                                            variant={activeRoster === "local" ? "primary" : "secondary"}
                                            disabled={isClosing}
                                            aria-expanded={activeRoster === "local"}
                                            onClick={() => setActiveRoster((current) => current === "local" ? null : "local")}
                                        >
                                            Lista local: {game.team_local?.name_team || "-"}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant={activeRoster === "visitor" ? "primary" : "secondary"}
                                            disabled={isClosing}
                                            aria-expanded={activeRoster === "visitor"}
                                            onClick={() => setActiveRoster((current) => current === "visitor" ? null : "visitor")}
                                        >
                                            Lista visitante: {game.team_visitor?.name_team || "-"}
                                        </Button>
                                    </div>

                                    {activeRoster === null ? (
                                        <p className="mt-5 text-sm text-gray-500">
                                            Seleccioná un equipo para consultar su lista y marcar la asistencia.
                                        </p>
                                    ) : activeRoster === "local" ? (
                                        <div className="mt-5">
                                            <PlayersTable
                                                title="Local"
                                                teamName={game.team_local?.name_team || "-"}
                                                players={local}
                                                disabled={isClosed || isClosing}
                                                onToggle={(playerId) =>
                                                    setLocal((current) => toggle(current, playerId))
                                                }
                                            />
                                        </div>
                                    ) : (
                                        <div className="mt-5">
                                            <PlayersTable
                                                title="Visitante"
                                                teamName={game.team_visitor?.name_team || "-"}
                                                players={visitor}
                                                disabled={isClosed || isClosing}
                                                onToggle={(playerId) =>
                                                    setVisitor((current) => toggle(current, playerId))
                                                }
                                            />
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <Label
                                        text="Observaciones"
                                        htmlFor="observations"
                                    />
                                    <div className="mt-1">
                                        <textarea
                                            id="observations"
                                            value={observations}
                                            disabled={isClosed || isClosing}
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
                                            disabled={isClosing}
                                        >
                                            Guardar asistencia
                                        </Button>
                                    </div>
                                )}
                                <FeedbackMessage feedback={sheetFeedback} />
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
                                                disabled={isClosing}
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
                                                            disabled={isClosing}
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
                                                            disabled={isClosing}
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
                                                        disabled={isClosing}
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
                                                        disabled={isClosing}
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
                                            <Button variant="primary" type="submit" disabled={isClosing}>
                                                {existingResult
                                                    ? "Guardar cambios del resultado"
                                                    : "Guardar resultado"}
                                            </Button>
                                        </div>
                                        <FeedbackMessage feedback={resultFeedback} />
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
