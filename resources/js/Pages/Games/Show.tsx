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

interface Fixture {
    id: number;
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

interface Props {
    game: Game;
}

const formatDate = (iso: string) => {
    if (!iso) return "-";
    const [year, month, day] = iso.split("-");
    return `${day}/${month}/${year}`;
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
    const [generalScore, setGeneralScore] = React.useState(
        existingResult
            ? `${existingResult.sets_local}-${existingResult.sets_visitor}`
            : ""
    );
    const [points, setPoints] = React.useState({
        set_1_points_local: existingResult?.set_1_points_local.toString() ?? "",
        set_1_points_visitor: existingResult?.set_1_points_visitor.toString() ?? "",
        set_2_points_local: existingResult?.set_2_points_local.toString() ?? "",
        set_2_points_visitor: existingResult?.set_2_points_visitor.toString() ?? "",
        set_3_points_local: existingResult?.set_3_points_local?.toString() ?? "",
        set_3_points_visitor: existingResult?.set_3_points_visitor?.toString() ?? "",
    });
    const thirdSetIsRequired = ["2-1", "1-2"].includes(generalScore);

    const updatePoints = (field: keyof typeof points, value: string) => {
        setPoints((current) => ({ ...current, [field]: value }));
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
                set_3_points_local: thirdSetIsRequired ? points.set_3_points_local : null,
                set_3_points_visitor: thirdSetIsRequired ? points.set_3_points_visitor : null,
            },
            { preserveScroll: true }
        );
    };

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
                                            : "/games"
                                    }
                                >
                                    <Button variant="secondary" size="sm">
                                        <Icon name="chevronLeft" size="sm" /> Volver
                                    </Button>
                                </Link>
                                <Link href={`/games/${game.id}/edit`}>
                                    <Button variant="primary" size="md">
                                        Editar
                                    </Button>
                                </Link>
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
                                                        <th className="px-3 py-2 text-left font-medium">Set</th>
                                                        <th className="px-3 py-2 font-medium">{game.team_local?.name_team || "Local"}</th>
                                                        <th className="px-3 py-2 font-medium">{game.team_visitor?.name_team || "Visitante"}</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="text-sm text-gray-800">
                                                    <tr className="border-b border-gray-100">
                                                        <th className="px-3 py-2 text-left font-medium">1</th>
                                                        <td className="px-3 py-2">{existingResult.set_1_points_local}</td>
                                                        <td className="px-3 py-2">{existingResult.set_1_points_visitor}</td>
                                                    </tr>
                                                    <tr className="border-b border-gray-100">
                                                        <th className="px-3 py-2 text-left font-medium">2</th>
                                                        <td className="px-3 py-2">{existingResult.set_2_points_local}</td>
                                                        <td className="px-3 py-2">{existingResult.set_2_points_visitor}</td>
                                                    </tr>
                                                    {existingResult.set_3_points_local !== null &&
                                                        existingResult.set_3_points_visitor !== null && (
                                                            <tr>
                                                                <th className="px-3 py-2 text-left font-medium">3</th>
                                                                <td className="px-3 py-2">{existingResult.set_3_points_local}</td>
                                                                <td className="px-3 py-2">{existingResult.set_3_points_visitor}</td>
                                                            </tr>
                                                        )}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}

                                    <form onSubmit={handleResultSubmit} className="space-y-5">
                                        <FormErrors />

                                        <div>
                                            <Label text="Resultado general en sets" htmlFor="general_score" />
                                            <select
                                                id="general_score"
                                                value={generalScore}
                                                onChange={(event) => setGeneralScore(event.target.value)}
                                                required
                                                className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400"
                                            >
                                                <option value="">Seleccioná el resultado</option>
                                                <option value="2-0">Local 2–0</option>
                                                <option value="2-1">Local 2–1</option>
                                                <option value="0-2">Visitante 2–0</option>
                                                <option value="1-2">Visitante 2–1</option>
                                            </select>
                                        </div>

                                        <div className="grid grid-cols-3 items-end gap-3">
                                            <span className="text-sm font-medium text-gray-600">Set</span>
                                            <span className="text-center text-sm font-medium text-gray-600">{game.team_local?.name_team || "Local"}</span>
                                            <span className="text-center text-sm font-medium text-gray-600">{game.team_visitor?.name_team || "Visitante"}</span>
                                            {([
                                                [1, "set_1_points_local", "set_1_points_visitor"],
                                                [2, "set_2_points_local", "set_2_points_visitor"],
                                            ] as const).map(([setNumber, localField, visitorField]) => (
                                                <React.Fragment key={setNumber}>
                                                    <span className="text-sm text-gray-700">Set {setNumber}</span>
                                                    <Input
                                                        id={localField}
                                                        type="number"
                                                        min="0"
                                                        required
                                                        aria-label={`Puntos de ${game.team_local?.name_team || "local"} en el set ${setNumber}`}
                                                        value={points[localField]}
                                                        onChange={(event) => updatePoints(localField, event.target.value)}
                                                    />
                                                    <Input
                                                        id={visitorField}
                                                        type="number"
                                                        min="0"
                                                        required
                                                        aria-label={`Puntos de ${game.team_visitor?.name_team || "visitante"} en el set ${setNumber}`}
                                                        value={points[visitorField]}
                                                        onChange={(event) => updatePoints(visitorField, event.target.value)}
                                                    />
                                                </React.Fragment>
                                            ))}

                                            {thirdSetIsRequired && (
                                                <>
                                                    <span className="text-sm text-gray-700">Set 3</span>
                                                    <Input
                                                        id="set_3_points_local"
                                                        type="number"
                                                        min="0"
                                                        required
                                                        aria-label={`Puntos de ${game.team_local?.name_team || "local"} en el set 3`}
                                                        value={points.set_3_points_local}
                                                        onChange={(event) => updatePoints("set_3_points_local", event.target.value)}
                                                    />
                                                    <Input
                                                        id="set_3_points_visitor"
                                                        type="number"
                                                        min="0"
                                                        required
                                                        aria-label={`Puntos de ${game.team_visitor?.name_team || "visitante"} en el set 3`}
                                                        value={points.set_3_points_visitor}
                                                        onChange={(event) => updatePoints("set_3_points_visitor", event.target.value)}
                                                    />
                                                </>
                                            )}
                                        </div>

                                        <div className="flex justify-end">
                                            <Button variant="primary" type="submit">
                                                {existingResult ? "Guardar cambios del resultado" : "Guardar resultado"}
                                            </Button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
