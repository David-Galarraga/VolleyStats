import React from "react";
import { router } from "@inertiajs/react";
import { Link, Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Button, Text, Input, Label, Select, Icon } from "@/Components/Atoms";
import FormErrors from "@/Components/FormErrors";
import {
    compatibleOpponentIds,
    windowsForTeam,
    intersection,
    toMinutes,
    fromMinutes,
    type Availability,
} from "@/utils/availability";

interface Category {
    id_category: number;
    name_category: string;
    genero_category: string;
}

interface Tournament {
    id: number;
    name_tournament: string;
    categories: Category[];
}

interface Team {
    id: number;
    name_team: string;
    id_category: number;
}

interface Fixture {
    id: number;
    id_tournament: number;
    name_fixture: string;
    start_date: string;
    end_date: string;
    tournament?: Tournament;
}

interface Planillero {
    id_user: number;
    name_user: string;
    email: string;
}

interface Props {
    tournaments: Tournament[];
    teams: Team[];
    fixture: Fixture;
    availabilities?: Availability[];
    phases: Record<string, string>;
    phaseInstances: Record<string, string>;
    playoffMatches: { id: number; category_id: number; code: string; stage: string; team_a_id: number | null; team_b_id: number | null }[];
    planilleros?: Planillero[];
}

export default function Create({ tournaments, teams, fixture, availabilities = [], phases, phaseInstances, playoffMatches, planilleros = [] }: Props) {
    const [idTournament, setIdTournament] = React.useState<number | "">(
        fixture.id_tournament
    );
    const [idCategory, setIdCategory] = React.useState<number | "">("");
    const [idTeamLocal, setIdTeamLocal] = React.useState<number | "">("");
    const [idTeamVisitor, setIdTeamVisitor] = React.useState<number | "">("");
    const [date, setDate] = React.useState(fixture.start_date);
    const [time, setTime] = React.useState("");
    const [statusGame, setStatusGame] = React.useState("pending");
    const [setLocal, setSetLocal] = React.useState<number | "">("");
    const [setVisitor, setSetVisitor] = React.useState<number | "">("");
    const [result, setResult] = React.useState("pending");
    const [phase, setPhase] = React.useState("");
    const [phaseInstance, setPhaseInstance] = React.useState("");
    const [setFormat, setSetFormat] = React.useState("best_of_3");
    const [playoffMatchId, setPlayoffMatchId] = React.useState("");
    const [planilleroIds, setPlanilleroIds] = React.useState<number[]>([]);

    const togglePlanillero = (id: number) => {
        setPlanilleroIds((current) =>
            current.includes(id)
                ? current.filter((value) => value !== id)
                : [...current, id]
        );
    };

    const availableCategories = React.useMemo(
        () =>
            tournaments.find((t) => t.id === Number(idTournament))
                ?.categories ?? [],
        [tournaments, idTournament]
    );

    const availableTeams = React.useMemo(
        () => teams.filter((team) => team.id_category === Number(idCategory)),
        [teams, idCategory]
    );

    const filteringActive = availabilities.length > 0;

    const compatibleIds = React.useMemo(() => {
        if (!filteringActive || !idTeamLocal) return null;
        return compatibleOpponentIds(
            availabilities,
            Number(idTeamLocal),
            date
        );
    }, [filteringActive, idTeamLocal, date, availabilities]);

    const overlapRange = React.useMemo(() => {
        if (!filteringActive || !idTeamLocal || !idTeamVisitor) return null;

        const local = windowsForTeam(
            availabilities,
            Number(idTeamLocal),
            date
        );
        const visitor = windowsForTeam(
            availabilities,
            Number(idTeamVisitor),
            date
        );

        let minStart: number | null = null;
        let maxEnd: number | null = null;

        for (const localWindow of local) {
            for (const visitorWindow of visitor) {
                const inter = intersection(localWindow, visitorWindow);
                if (!inter) continue;

                const start = toMinutes(inter.start);
                const end = toMinutes(inter.end);

                if (minStart === null || start < minStart) minStart = start;
                if (maxEnd === null || end > maxEnd) maxEnd = end;
            }
        }

        if (minStart === null || maxEnd === null) return null;

        return { start: fromMinutes(minStart), end: fromMinutes(maxEnd) };
    }, [filteringActive, idTeamLocal, idTeamVisitor, date, availabilities]);

    React.useEffect(() => {
        if (!filteringActive) return;
        if (idTeamVisitor && compatibleIds && !compatibleIds.has(Number(idTeamVisitor))) {
            setIdTeamVisitor("");
        }
    }, [compatibleIds]);

    React.useEffect(() => {
        if (!overlapRange) return;
        if (
            !time ||
            toMinutes(time) < toMinutes(overlapRange.start) ||
            toMinutes(time) >= toMinutes(overlapRange.end)
        ) {
            setTime(overlapRange.start);
        }
    }, [overlapRange]);

    React.useEffect(() => {
        if (
            idCategory &&
            !availableCategories.some(
                (category) => category.id_category === Number(idCategory)
            )
        ) {
            setIdCategory("");
            setIdTeamLocal("");
            setIdTeamVisitor("");
        }
    }, [availableCategories]);

    const isVisitorDisabled = (teamId: number) => {
        if (teamId === Number(idTeamLocal)) return true;
        if (filteringActive && compatibleIds) {
            return !compatibleIds.has(teamId);
        }
        return false;
    };

    const formatDate = (iso: string) => {
        if (!iso) return "-";
        const [year, month, day] = iso.split("-");
        return `${day}/${month}/${year}`;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        router.post("/games", {
            id_tournament: idTournament,
            id_category: idCategory,
            id_fixture: fixture.id,
            id_team_local: idTeamLocal,
            id_team_visitor: idTeamVisitor,
            phase,
            phase_instance: phase === "playoff" ? phaseInstance : null,
            set_format: setFormat,
            playoff_match_id: playoffMatchId || null,
            date: date,
            time: time,
            status_game: statusGame || "pending",
            set_local: setLocal === "" ? null : setLocal,
            set_visitor: setVisitor === "" ? null : setVisitor,
            result: result || "pendiente",
            planillero_ids: planilleroIds,
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <Text variant="h2" color="primary">
                    Crear Partido
                </Text>
            }
        >
            <Head title="Crear Partido" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-md border-t-4 border-yellow-400 sm:rounded-lg">
                        <div className="p-8">
                            <form
                                onSubmit={handleSubmit}
                                className="space-y-6 max-w-xl"
                            >
                                <FormErrors />
                                <div className="rounded-md border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-gray-700">
                                    Partido para el fixture{" "}
                                    <span className="font-semibold">
                                        {fixture.name_fixture}
                                    </span>
                                    {fixture.tournament
                                        ? ` (${fixture.tournament.name_tournament})`
                                        : ""}
                                    .
                                </div>
                                <div>
                                    <Label
                                        text="Torneo"
                                        htmlFor="id_tournament"
                                    />
                                    <div className="mt-1">
                                        <Select
                                            id="id_tournament"
                                            value={idTournament}
                                            onChange={(e) =>
                                                setIdTournament(
                                                    Number(e.target.value)
                                                )
                                            }
                                            disabled
                                            required
                                        >
                                            <option value="">
                                                Seleccione un torneo
                                            </option>
                                            {tournaments.map((tournament) => (
                                                <option
                                                    key={tournament.id}
                                                    value={tournament.id}
                                                >
                                                    {tournament.name_tournament}
                                                </option>
                                            ))}
                                        </Select>
                                    </div>
                                </div>

                                <div>
                                    <Label
                                        text="Categoría"
                                        htmlFor="id_category"
                                    />
                                    <div className="mt-1">
                                        <Select
                                            id="id_category"
                                            value={idCategory}
                                            onChange={(e) => {
                                                setIdCategory(
                                                    e.target.value === ""
                                                        ? ""
                                                        : Number(e.target.value)
                                                );
                                                setIdTeamLocal("");
                                                setIdTeamVisitor("");
                                            }}
                                            required
                                        >
                                            <option value="">
                                                Seleccione una categoría
                                            </option>
                                            {availableCategories.map(
                                                (category) => (
                                                    <option
                                                        key={
                                                            category.id_category
                                                        }
                                                        value={
                                                            category.id_category
                                                        }
                                                    >
                                                        {category.name_category}{" "}
                                                        ({category.genero_category})
                                                    </option>
                                                )
                                            )}
                                        </Select>
                                    </div>
                                </div>

                                <div>
                                    <Label text="Fase" htmlFor="phase" />
                                    <div className="mt-1">
                                        <Select
                                            id="phase"
                                            value={phase}
                                            onChange={(event) => { setPhase(event.target.value); setPhaseInstance(""); setPlayoffMatchId(""); if (event.target.value === "regular") setSetFormat("best_of_3"); }}
                                            required
                                        >
                                            <option value="">Seleccione una fase</option>
                                            {Object.entries(phases).map(([value, label]) => (
                                                <option key={value} value={value}>{label}</option>
                                            ))}
                                        </Select>
                                    </div>
                                </div>

                                {phase === "playoff" && <>
                                    <div><Label text="Etapa" htmlFor="phase_instance" /><div className="mt-1"><Select id="phase_instance" value={phaseInstance} onChange={(e) => setPhaseInstance(e.target.value)} required><option value="">Seleccione una etapa</option>{Object.entries(phaseInstances).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Select></div></div>
                                    <div><Label text="Formato" htmlFor="set_format" /><div className="mt-1"><Select id="set_format" value={setFormat} onChange={(e) => setSetFormat(e.target.value)}><option value="best_of_3">Mejor de tres sets</option><option value="best_of_5">Mejor de cinco sets</option></Select></div></div>
                                    <div><Label text="Cruce del prode (opcional)" htmlFor="playoff_match_id" /><div className="mt-1"><Select id="playoff_match_id" value={playoffMatchId} onChange={(e) => { const id = e.target.value; setPlayoffMatchId(id); const match = playoffMatches.find((item) => item.id === Number(id)); if (match) { setPhaseInstance(match.stage); setIdCategory(match.category_id); if (match.team_a_id) setIdTeamLocal(match.team_a_id); if (match.team_b_id) setIdTeamVisitor(match.team_b_id); } }}><option value="">Sin asociar</option>{playoffMatches.filter((item) => item.category_id === Number(idCategory)).map((item) => <option key={item.id} value={item.id}>({item.code}) {item.stage}</option>)}</Select></div></div>
                                </>}

                                <div>
                                    <Label
                                        text="Equipo local"
                                        htmlFor="id_team_local"
                                    />
                                    <div className="mt-1">
                                        <Select
                                            id="id_team_local"
                                            value={idTeamLocal}
                                            onChange={(e) => {
                                                const value = Number(
                                                    e.target.value
                                                );
                                                setIdTeamLocal(value);
                                                if (value === idTeamVisitor) {
                                                    setIdTeamVisitor("");
                                                }
                                            }}
                                            required
                                        >
                                            <option value="">
                                                Seleccione el equipo local
                                            </option>
                                            {availableTeams.map((team) => (
                                                <option
                                                    key={team.id}
                                                    value={team.id}
                                                    disabled={
                                                        team.id ===
                                                        idTeamVisitor
                                                    }
                                                >
                                                    {team.name_team}
                                                </option>
                                            ))}
                                        </Select>
                                    </div>
                                </div>

                                <div>
                                    <Label
                                        text="Equipo visitante"
                                        htmlFor="id_team_visitor"
                                    />
                                    <div className="mt-1">
                                        <Select
                                            id="id_team_visitor"
                                            value={idTeamVisitor}
                                            onChange={(e) => {
                                                const value = Number(
                                                    e.target.value
                                                );
                                                setIdTeamVisitor(value);
                                                if (value === idTeamLocal) {
                                                    setIdTeamLocal("");
                                                }
                                            }}
                                            required
                                        >
                                            <option value="">
                                                Seleccione el equipo visitante
                                            </option>
                                            {availableTeams.map((team) => (
                                                <option
                                                    key={team.id}
                                                    value={team.id}
                                                    disabled={isVisitorDisabled(
                                                        team.id
                                                    )}
                                                >
                                                    {team.name_team}
                                                </option>
                                            ))}
                                        </Select>
                                    </div>
                                    {filteringActive && (
                                        <p className="mt-1 text-xs text-gray-500">
                                            Solo se listan los equipos con
                                            franja horaria compatible con el
                                            local.
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label text="Día" htmlFor="date" />
                                    <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:gap-6">
                                        <label className="flex items-center gap-2 text-sm text-gray-700">
                                            <input
                                                type="radio"
                                                name="date"
                                                value={fixture.start_date}
                                                checked={
                                                    date ===
                                                    fixture.start_date
                                                }
                                                onChange={() =>
                                                    setDate(
                                                        fixture.start_date
                                                    )
                                                }
                                                className="h-4 w-4 border-gray-300 text-yellow-500 focus:ring-yellow-400"
                                                required
                                            />
                                            Sábado (
                                            {formatDate(fixture.start_date)})
                                        </label>
                                        <label className="flex items-center gap-2 text-sm text-gray-700">
                                            <input
                                                type="radio"
                                                name="date"
                                                value={fixture.end_date}
                                                checked={
                                                    date ===
                                                    fixture.end_date
                                                }
                                                onChange={() =>
                                                    setDate(
                                                        fixture.end_date
                                                    )
                                                }
                                                className="h-4 w-4 border-gray-300 text-yellow-500 focus:ring-yellow-400"
                                            />
                                            Domingo (
                                            {formatDate(fixture.end_date)})
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <Label text="Hora" htmlFor="time" />
                                    <div className="mt-1">
                                        <Input
                                            id="time"
                                            type="time"
                                            value={time}
                                            min={overlapRange?.start}
                                            max={overlapRange?.end}
                                            onChange={(e) =>
                                                setTime(e.target.value)
                                            }
                                            required
                                        />
                                    </div>
                                    {overlapRange && (
                                        <p className="mt-1 text-xs text-gray-500">
                                            Franja compatible:{" "}
                                            {overlapRange.start} a{" "}
                                            {overlapRange.end}.
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label
                                        text="Estado del partido"
                                        htmlFor="status_game"
                                    />
                                    <div className="mt-1">
                                        <Select
                                            id="status_game"
                                            value={statusGame}
                                            onChange={(e) =>
                                                setStatusGame(e.target.value)
                                            }
                                            required
                                        >
                                            <option value="pending">
                                                Pendiente
                                            </option>
                                            <option value="finished">
                                                Finalizado
                                            </option>
                                        </Select>
                                    </div>
                                </div>

                                <div className="rounded-md border border-gray-200 p-4">
                                    <Label text="Planilleros asignados" />
                                    {planilleros.length === 0 ? (
                                        <p className="mt-2 text-sm text-gray-500">
                                            No hay usuarios con el rol Planillero.
                                        </p>
                                    ) : (
                                        <div className="mt-3 space-y-2">
                                            {planilleros.map((planillero) => (
                                                <label
                                                    key={planillero.id_user}
                                                    className="flex items-center gap-2 text-sm text-gray-700"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={planilleroIds.includes(
                                                            planillero.id_user
                                                        )}
                                                        onChange={() =>
                                                            togglePlanillero(
                                                                planillero.id_user
                                                            )
                                                        }
                                                        className="h-4 w-4 rounded border-gray-300 text-yellow-500 focus:ring-yellow-400"
                                                    />
                                                    {planillero.name_user}
                                                    <span className="text-xs text-gray-500">
                                                        {planillero.email}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-4 pt-4">
                                    <Button variant="primary" type="submit">
                                        Crear partido
                                    </Button>
                                    <Link
                                        href={`/fixtures/${fixture.id}`}
                                    >
                                        <Button variant="secondary" size="sm">
                                            <Icon
                                                name="chevronLeft"
                                                size="sm"
                                            />{" "}
                                            Volver
                                        </Button>
                                    </Link>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
