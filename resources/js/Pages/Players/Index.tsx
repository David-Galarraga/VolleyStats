import React from "react";
import { router } from "@inertiajs/react";
import { Link, Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Button, Text, Icon } from "@/Components/Atoms";

interface Team {
    id: number;
    name_team: string;
    trainer?: Trainer | null;
}

interface Trainer {
    name_trainer: string;
    dni_trainer: string | null;
    birthdate_trainer: string | null;
}

interface Player {
    id: number;
    id_team: number;
    name_player: string;
    dni_player: string;
    birthdate_player: string;
    team?: Team;
}

interface Props {
    players: Player[];
    team?: Team;
}

export default function Index({ players, team }: Props) {
    const handleDelete = (id: number) => {
        if (confirm("¿Estás seguro de que deseas eliminar este jugador?")) {
            router.delete(team ? `/teams/${team.id}/players/${id}` : `/players/${id}`);
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <Text variant="h2" color="primary">
                    {team ? `Lista de buena fe — ${team.name_team}` : "Jugadores"}
                </Text>
            }
        >
            <Head title={team ? `Buena fe — ${team.name_team}` : "Jugadores"} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-md border-t-4 border-yellow-400 sm:rounded-lg">
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-8">
                                <Link href={team ? "/teams" : "/standings"}>
                                    <Button variant="secondary" size="sm">
                                        <Icon name="chevronLeft" size="sm" /> Volver
                                    </Button>
                                </Link>
                                {team ? (
                                    <Link href={`/teams/${team.id}/players/create`}>
                                        <Button variant="primary" size="md">Agregar jugador/a</Button>
                                    </Link>
                                ) : (
                                    <Link href="/players/create">
                                        <Button variant="primary" size="md">Nuevo jugador</Button>
                                    </Link>
                                )}
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Nombre y apellido
                                            </th>
                                            {!team && <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Equipo</th>}
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                DNI
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Fecha de nacimiento
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {players.map((player) => (
                                            <tr
                                                key={player.id}
                                                className="hover:bg-gray-50 transition-colors"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                                                    {player.name_player}
                                                </td>
                                                {!team && <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{player.team?.name_team || "-"}</td>}
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                    {player.dni_player}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                    {player.birthdate_player}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Link
                                                            href={team ? `/teams/${team.id}/players/${player.id}/edit` : `/players/${player.id}/edit`}
                                                        >
                                                            <Button
                                                                variant="secondary"
                                                                size="sm"
                                                            >
                                                                Editar
                                                            </Button>
                                                        </Link>
                                                        <Button
                                                            variant="danger"
                                                            size="sm"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    player.id
                                                                )
                                                            }
                                                        >
                                                            Eliminar
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {players.length === 0 && (
                                <div className="text-center py-8">
                                    <Text variant="p" color="secondary">
                                        {team ? "Este equipo todavía no tiene jugadores en su lista de buena fe." : "No hay jugadores registrados."}
                                    </Text>
                                </div>
                            )}

                            {team && (
                                <section className="mt-8 border-t border-gray-200 pt-5" aria-label="Datos del entrenador">
                                    <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700">DT:</h3>
                                    {team.trainer ? (
                                        <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
                                            <div><dt className="font-medium text-gray-500">Nombre y apellido</dt><dd className="mt-1 text-gray-800">{team.trainer.name_trainer}</dd></div>
                                            <div><dt className="font-medium text-gray-500">DNI</dt><dd className="mt-1 text-gray-800">{team.trainer.dni_trainer || "-"}</dd></div>
                                            <div><dt className="font-medium text-gray-500">Fecha de nacimiento</dt><dd className="mt-1 text-gray-800">{team.trainer.birthdate_trainer || "-"}</dd></div>
                                        </dl>
                                    ) : (
                                        <p className="mt-2 text-sm text-gray-600">No hay un entrenador asociado a este equipo.</p>
                                    )}
                                </section>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
