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

interface Props {
    teams?: Team[];
    team?: Team;
}

export default function Create({ teams = [], team }: Props) {
    const [idTeam, setIdTeam] = React.useState<number | "">(team?.id ?? "");
    const [namePlayer, setNamePlayer] = React.useState("");
    const [dniPlayer, setDniPlayer] = React.useState("");
    const [birthdatePlayer, setBirthdatePlayer] = React.useState("");
    const today = todayIso();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        router.post(team ? `/teams/${team.id}/players` : "/players", {
            id_team: idTeam,
            name_player: namePlayer,
            dni_player: dniPlayer,
            birthdate_player: birthdatePlayer,
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <Text variant="h2" color="primary">
                    {team ? `Agregar jugador/a a ${team.name_team}` : "Crear Jugador"}
                </Text>
            }
        >
            <Head title="Crear Jugador" />

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
                                        text="Nombre y apellido"
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
                                            placeholder="Ingrese el nombre y apellido"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label
                                        text="DNI"
                                        htmlFor="dni_player"
                                    />
                                    <div className="mt-1">
                                        <Input
                                            id="dni_player"
                                            type="text"
                                            inputMode="numeric"
                                            value={dniPlayer}
                                            onChange={(e) =>
                                                setDniPlayer(
                                                    e.target.value.replace(/\D/g, "").slice(0, 8)
                                                )
                                            }
                                            placeholder="8 dígitos"
                                            required
                                            minLength={8}
                                            maxLength={8}
                                            pattern="[0-9]{8}"
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

                                <div className="flex items-center gap-4 pt-4">
                                    <Button variant="primary" type="submit">
                                        Crear jugador
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
