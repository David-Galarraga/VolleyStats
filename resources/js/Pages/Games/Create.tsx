import React from "react";
import { router } from "@inertiajs/react";
import { Link, Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Button, Text, Input, Label, Icon, DateInput, todayIso } from "@/Components/Atoms";
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
    id_tournament: number;
    name_fixture: string;
    start_date: string;
    end_date: string;
    tournament?: Tournament;
}

interface Props {
    tournaments: Tournament[];
    teams: Team[];
    referees: Referee[];
    fixture?: Fixture | null;
}

export default function Create({ tournaments, teams, referees, fixture }: Props) {
    const [idTournament, setIdTournament] = React.useState<number | "">(
        fixture?.id_tournament ?? ""
    );
    const [idTeamLocal, setIdTeamLocal] = React.useState<number | "">("");
    const [idTeamVisitor, setIdTeamVisitor] = React.useState<number | "">("");
    const [idReferee, setIdReferee] = React.useState<number | "">("");
    const [date, setDate] = React.useState(fixture?.start_date ?? "");
    const [time, setTime] = React.useState("");
    const [statusGame, setStatusGame] = React.useState("pending");
    const [setLocal, setSetLocal] = React.useState<number | "">("");
    const [setVisitor, setSetVisitor] = React.useState<number | "">("");
    const [result, setResult] = React.useState("pending");
    const today = todayIso();

    const formatDate = (iso: string) => {
        if (!iso) return "-";
        const [year, month, day] = iso.split("-");
        return `${day}/${month}/${year}`;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        router.post("/games", {
            id_tournament: idTournament,
            id_fixture: fixture?.id ?? null,
            id_team_local: idTeamLocal,
            id_team_visitor: idTeamVisitor,
            id_referee: idReferee,
            date: date,
            time: time,
            status_game: statusGame || "pending",
            set_local: setLocal === "" ? null : setLocal,
            set_visitor: setVisitor === "" ? null : setVisitor,
            result: result || "pending",
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
                                {fixture && (
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
                                )}
                                <div>
                                    <Label
                                        text="Torneo"
                                        htmlFor="id_tournament"
                                    />
                                    <div className="mt-1">
                                        <select
                                            id="id_tournament"
                                            value={idTournament}
                                            onChange={(e) =>
                                                setIdTournament(
                                                    Number(e.target.value)
                                                )
                                            }
                                            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400 disabled:bg-gray-100 disabled:text-gray-500"
                                            disabled={!!fixture}
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
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <Label
                                        text="Equipo local"
                                        htmlFor="id_team_local"
                                    />
                                    <div className="mt-1">
                                        <select
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
                                            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400"
                                            required
                                        >
                                            <option value="">
                                                Seleccione el equipo local
                                            </option>
                                            {teams.map((team) => (
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
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <Label
                                        text="Equipo visitante"
                                        htmlFor="id_team_visitor"
                                    />
                                    <div className="mt-1">
                                        <select
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
                                            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400"
                                            required
                                        >
                                            <option value="">
                                                Seleccione el equipo visitante
                                            </option>
                                            {teams.map((team) => (
                                                <option
                                                    key={team.id}
                                                    value={team.id}
                                                    disabled={
                                                        team.id ===
                                                        idTeamLocal
                                                    }
                                                >
                                                    {team.name_team}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <Label text="Árbitro" htmlFor="id_referee" />
                                    <div className="mt-1">
                                        <select
                                            id="id_referee"
                                            value={idReferee}
                                            onChange={(e) =>
                                                setIdReferee(
                                                    Number(e.target.value)
                                                )
                                            }
                                            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400"
                                            required
                                        >
                                            <option value="">
                                                Seleccione un árbitro
                                            </option>
                                            {referees.map((referee) => (
                                                <option
                                                    key={referee.id}
                                                    value={referee.id}
                                                >
                                                    {referee.name_referee}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {fixture ? (
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
                                ) : (
                                    <div>
                                        <Label text="Fecha" htmlFor="date" />
                                        <div className="mt-1">
                                            <DateInput
                                                id="date"
                                                min={today}
                                                value={date}
                                                onChange={(iso) =>
                                                    setDate(iso)
                                                }
                                                required
                                            />
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <Label text="Hora" htmlFor="time" />
                                    <div className="mt-1">
                                        <Input
                                            id="time"
                                            type="time"
                                            value={time}
                                            onChange={(e) =>
                                                setTime(e.target.value)
                                            }
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label
                                        text="Estado del partido"
                                        htmlFor="status_game"
                                    />
                                    <div className="mt-1">
                                        <select
                                            id="status_game"
                                            value={statusGame}
                                            onChange={(e) =>
                                                setStatusGame(e.target.value)
                                            }
                                            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400"
                                            required
                                        >
                                            <option value="pending">
                                                Pendiente
                                            </option>
                                            <option value="finished">
                                                Finalizado
                                            </option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label
                                            text="Sets local"
                                            htmlFor="set_local"
                                        />
                                        <div className="mt-1">
                                            <Input
                                                id="set_local"
                                                type="number"
                                                value={setLocal}
                                                onChange={(e) =>
                                                    setSetLocal(
                                                        e.target.value === ""
                                                            ? ""
                                                            : Number(
                                                                  e.target.value
                                                              )
                                                    )
                                                }
                                                placeholder="Opcional"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Label
                                            text="Sets visitante"
                                            htmlFor="set_visitor"
                                        />
                                        <div className="mt-1">
                                            <Input
                                                id="set_visitor"
                                                type="number"
                                                value={setVisitor}
                                                onChange={(e) =>
                                                    setSetVisitor(
                                                        e.target.value === ""
                                                            ? ""
                                                            : Number(
                                                                  e.target.value
                                                              )
                                                    )
                                                }
                                                placeholder="Opcional"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <Label text="Resultado" htmlFor="result" />
                                    <div className="mt-1">
                                        <Input
                                            id="result"
                                            type="text"
                                            value={result}
                                            onChange={(e) =>
                                                setResult(e.target.value)
                                            }
                                            placeholder="pending"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 pt-4">
                                    <Button variant="primary" type="submit">
                                        Crear partido
                                    </Button>
                                    <Link
                                        href={
                                            fixture
                                                ? `/fixtures/${fixture.id}`
                                                : "/games"
                                        }
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
