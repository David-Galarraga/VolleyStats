import React from "react";
import { router } from "@inertiajs/react";
import { Link, Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Button, Text, Input, Label, Icon, DateInput, todayIso } from "@/Components/Atoms";
import FormErrors from "@/Components/FormErrors";

interface Team {
    id: number;
    name_team: string;
}

interface Player {
    id: number;
    id_team: number;
    name_player: string;
    birthdate_player: string;
    number_player: number;
}

interface Props {
    player: Player;
    teams?: Team[];
    team?: Team;
}

export default function Edit({ player, teams = [], team }: Props) {
    const [idTeam, setIdTeam] = React.useState<number | "">(
        player.id_team ? Number(player.id_team) : ""
    );
    const [namePlayer, setNamePlayer] = React.useState(player.name_player || "");
    const [birthdatePlayer, setBirthdatePlayer] = React.useState(
        player.birthdate_player ? player.birthdate_player.slice(0, 10) : ""
    );
    const [numberPlayer, setNumberPlayer] = React.useState<number | "">(
        player.number_player ?? ""
    );
    const today = todayIso();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        router.put(team ? `/teams/${team.id}/players/${player.id}` : `/players/${player.id}`, {
            id_team: idTeam,
            name_player: namePlayer,
            birthdate_player: birthdatePlayer,
            number_player: numberPlayer,
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <Text variant="h2" color="primary">
                    Editar Jugador
                </Text>
            }
        >
            <Head title="Editar Jugador" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-md border-t-4 border-yellow-400 sm:rounded-lg">
                        <div className="p-8">
                            <form
                                onSubmit={handleSubmit}
                                className="space-y-6 max-w-xl"
                            >
                                <FormErrors />
                                <div>
                                    {team ? (
                                        <p className="rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-700">Equipo: {team.name_team}</p>
                                    ) : <>
                                    <Label text="Equipo" htmlFor="id_team" />
                                    <div className="mt-1">
                                        <select
                                            id="id_team"
                                            value={idTeam}
                                            onChange={(e) =>
                                                setIdTeam(Number(e.target.value))
                                            }
                                            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400"
                                            required
                                        >
                                            <option value="">
                                                Seleccione un equipo
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
                                    </>}
                                </div>

                                <div>
                                    <Label
                                        text="Nombre del jugador"
                                        htmlFor="name_player"
                                    />
                                    <div className="mt-1">
                                        <Input
                                            id="name_player"
                                            type="text"
                                            value={namePlayer}
                                            onChange={(e) =>
                                                setNamePlayer(e.target.value)
                                            }
                                            placeholder="Ingrese el nombre del jugador"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label
                                        text="Fecha de nacimiento"
                                        htmlFor="birthdate_player"
                                    />
                                    <div className="mt-1">
                                        <DateInput
                                            id="birthdate_player"
                                            max={today}
                                            value={birthdatePlayer}
                                            onChange={(iso) =>
                                                setBirthdatePlayer(iso)
                                            }
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label
                                        text="Número de camiseta"
                                        htmlFor="number_player"
                                    />
                                    <div className="mt-1">
                                        <Input
                                            id="number_player"
                                            type="number"
                                            value={numberPlayer}
                                            onChange={(e) =>
                                                setNumberPlayer(
                                                    e.target.value === ""
                                                        ? ""
                                                        : Number(e.target.value)
                                                )
                                            }
                                            placeholder="Ingrese el número"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 pt-4">
                                    <Button variant="primary" type="submit">
                                        Actualizar
                                    </Button>
                                    <Link href={team ? `/teams/${team.id}/players` : "/players"}>
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
