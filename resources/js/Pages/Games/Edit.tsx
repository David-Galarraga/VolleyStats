import React from "react";
import { router } from "@inertiajs/react";
import { Link, Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Button, Text, Input, Label, Icon, DateInput } from "@/Components/Atoms";

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

interface Game {
    id: number;
    id_tournament: number;
    id_team_local: number;
    id_team_visitor: number;
    id_referee: number;
    date: string;
    time: string;
    status_game: string;
    set_local: number | null;
    set_visitor: number | null;
    result: string;
}

interface Props {
    game: Game;
    tournaments: Tournament[];
    teams: Team[];
    referees: Referee[];
}

export default function Edit({ game, tournaments, teams, referees }: Props) {
    const [idTournament, setIdTournament] = React.useState<number | "">(
        game.id_tournament || ""
    );
    const [idTeamLocal, setIdTeamLocal] = React.useState<number | "">(
        game.id_team_local || ""
    );
    const [idTeamVisitor, setIdTeamVisitor] = React.useState<number | "">(
        game.id_team_visitor || ""
    );
    const [idReferee, setIdReferee] = React.useState<number | "">(
        game.id_referee || ""
    );
    const [date, setDate] = React.useState(
        game.date ? game.date.slice(0, 10) : ""
    );
    const [time, setTime] = React.useState(
        game.time ? game.time.slice(0, 5) : ""
    );
    const [statusGame, setStatusGame] = React.useState(
        game.status_game || "pending"
    );
    const [setLocal, setSetLocal] = React.useState<number | "">(
        game.set_local ?? ""
    );
    const [setVisitor, setSetVisitor] = React.useState<number | "">(
        game.set_visitor ?? ""
    );
    const [result, setResult] = React.useState(game.result || "pending");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        router.put(`/games/${game.id}`, {
            id_tournament: idTournament,
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
                    Editar Partido
                </Text>
            }
        >
            <Head title="Editar Partido" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-md border-t-4 border-yellow-400 sm:rounded-lg">
                        <div className="p-8">
                            <form
                                onSubmit={handleSubmit}
                                className="space-y-6 max-w-xl"
                            >
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
                                            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400"
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
                                            onChange={(e) =>
                                                setIdTeamLocal(
                                                    Number(e.target.value)
                                                )
                                            }
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
                                            onChange={(e) =>
                                                setIdTeamVisitor(
                                                    Number(e.target.value)
                                                )
                                            }
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

                                <div>
                                    <Label text="Fecha" htmlFor="date" />
                                    <div className="mt-1">
                                        <DateInput
                                            id="date"
                                            value={date}
                                            onChange={(iso) => setDate(iso)}
                                            required
                                        />
                                    </div>
                                </div>

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
                                        Guardar cambios
                                    </Button>
                                    <Link href="/games">
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
