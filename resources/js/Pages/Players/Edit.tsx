import React from "react";
import { router } from "@inertiajs/react";
import { Link, Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Button, Text, Input, Label, Icon, DateInput } from "@/Components/Atoms";

interface Team {
    id: number;
    name_team: string;
}

interface Player {
    id: number;
    id_team: string;
    name_player: string;
    phone_player: string | null;
    genre_player: string;
    position_player: string;
    birthdate_player: string;
    number_player: number;
}

interface Props {
    player: Player;
    teams: Team[];
}

export default function Edit({ player, teams }: Props) {
    const [idTeam, setIdTeam] = React.useState<number | "">(
        player.id_team ? Number(player.id_team) : ""
    );
    const [namePlayer, setNamePlayer] = React.useState(player.name_player || "");
    const [phonePlayer, setPhonePlayer] = React.useState(
        player.phone_player || ""
    );
    const [genrePlayer, setGenrePlayer] = React.useState(
        player.genre_player || ""
    );
    const [positionPlayer, setPositionPlayer] = React.useState(
        player.position_player || ""
    );
    const [birthdatePlayer, setBirthdatePlayer] = React.useState(
        player.birthdate_player ? player.birthdate_player.slice(0, 10) : ""
    );
    const [numberPlayer, setNumberPlayer] = React.useState<number | "">(
        player.number_player ?? ""
    );
    const today = new Date().toISOString().slice(0, 10);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        router.put(`/players/${player.id}`, {
            id_team: idTeam,
            name_player: namePlayer,
            phone_player: phonePlayer || null,
            genre_player: genrePlayer,
            position_player: positionPlayer,
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
                                <div>
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
                                        text="Teléfono"
                                        htmlFor="phone_player"
                                    />
                                    <div className="mt-1">
                                        <Input
                                            id="phone_player"
                                            type="tel"
                                            value={phonePlayer}
                                            onChange={(e) =>
                                                setPhonePlayer(e.target.value)
                                            }
                                            placeholder="Ingrese el teléfono (opcional)"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label
                                        text="Género"
                                        htmlFor="genre_player"
                                    />
                                    <div className="mt-1">
                                        <Input
                                            id="genre_player"
                                            type="text"
                                            value={genrePlayer}
                                            onChange={(e) =>
                                                setGenrePlayer(e.target.value)
                                            }
                                            placeholder="Ingrese el género"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label
                                        text="Posición"
                                        htmlFor="position_player"
                                    />
                                    <div className="mt-1">
                                        <Input
                                            id="position_player"
                                            type="text"
                                            value={positionPlayer}
                                            onChange={(e) =>
                                                setPositionPlayer(e.target.value)
                                            }
                                            placeholder="Ingrese la posición"
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
                                        text="Número"
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
                                            placeholder="Ingrese el número de camiseta"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 pt-4">
                                    <Button variant="primary" type="submit">
                                        Actualizar
                                    </Button>
                                    <Link href="/players">
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
