import React from "react";
import { router, Link, Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Button, Text, Input, Label, Icon } from "@/Components/Atoms";
import FormErrors from "@/Components/FormErrors";
import type { Availability } from "@/utils/availability";

interface Team {
    id: number;
    name_team: string;
}

interface Tournament {
    id: number;
    name_tournament: string;
}

interface Fixture {
    id: number;
    name_fixture: string;
    start_date: string;
    end_date: string;
    tournament?: Tournament;
}

interface Props {
    fixture: Fixture;
    teams: Team[];
    availabilities: Availability[];
}

const formatTime = (time: string) => (time ? time.slice(0, 5) : "-");

const formatDate = (iso: string) => {
    if (!iso) return "-";
    const [year, month, day] = iso.split("-");
    return `${day}/${month}/${year}`;
};

const dayLabel = (date: string, fixture: Fixture) =>
    date === fixture.start_date ? "Sábado" : "Domingo";

export default function Availabilities({
    fixture,
    teams,
    availabilities,
}: Props) {
    const [idTeam, setIdTeam] = React.useState<number | "">("");
    const [date, setDate] = React.useState(fixture.start_date);
    const [startTime, setStartTime] = React.useState("");
    const [endTime, setEndTime] = React.useState("");
    const [editingId, setEditingId] = React.useState<number | null>(null);

    const resetForm = () => {
        setIdTeam("");
        setDate(fixture.start_date);
        setStartTime("");
        setEndTime("");
        setEditingId(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            id_team: idTeam,
            date,
            start_time: startTime,
            end_time: endTime,
        };

        if (editingId) {
            router.put(`/availabilities/${editingId}`, payload);
        } else {
            router.post(`/fixtures/${fixture.id}/availabilities`, payload);
        }
    };

    const handleEdit = (availability: Availability) => {
        setEditingId(availability.id);
        setIdTeam(availability.id_team);
        setDate(availability.date);
        setStartTime(availability.start_time.slice(0, 5));
        setEndTime(availability.end_time.slice(0, 5));
    };

    const handleDelete = (id: number) => {
        if (confirm("¿Eliminar esta franja horaria?")) {
            router.delete(`/availabilities/${id}`);
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <Text variant="h2" color="primary">
                    Disponibilidad del fixture
                </Text>
            }
        >
            <Head title={`Disponibilidad - ${fixture.name_fixture}`} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-md border-t-4 border-yellow-400 sm:rounded-lg">
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-8">
                                <Link href={`/fixtures/${fixture.id}`}>
                                    <Button variant="secondary" size="sm">
                                        <Icon name="chevronLeft" size="sm" />{" "}
                                        Volver
                                    </Button>
                                </Link>
                                <Text variant="p" color="secondary">
                                    {fixture.name_fixture}
                                    {fixture.tournament
                                        ? ` — ${fixture.tournament.name_tournament}`
                                        : ""}
                                </Text>
                            </div>

                            <div className="mb-10 rounded-md border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-gray-700">
                                Sábado {formatDate(fixture.start_date)} y domingo{" "}
                                {formatDate(fixture.end_date)}.
                            </div>

                            <form
                                onSubmit={handleSubmit}
                                className="space-y-6 max-w-xl mb-12"
                            >
                                <FormErrors />
                                <Text variant="h3" color="primary">
                                    {editingId
                                        ? "Editar franja"
                                        : "Agregar franja"}
                                </Text>

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
                                    <Label text="Día" htmlFor="date" />
                                    <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:gap-6">
                                        <label className="flex items-center gap-2 text-sm text-gray-700">
                                            <input
                                                type="radio"
                                                name="date"
                                                value={fixture.start_date}
                                                checked={
                                                    date === fixture.start_date
                                                }
                                                onChange={() =>
                                                    setDate(fixture.start_date)
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
                                                    date === fixture.end_date
                                                }
                                                onChange={() =>
                                                    setDate(fixture.end_date)
                                                }
                                                className="h-4 w-4 border-gray-300 text-yellow-500 focus:ring-yellow-400"
                                                required
                                            />
                                            Domingo (
                                            {formatDate(fixture.end_date)})
                                        </label>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label
                                            text="Hora de inicio"
                                            htmlFor="start_time"
                                        />
                                        <div className="mt-1">
                                            <Input
                                                id="start_time"
                                                type="time"
                                                value={startTime}
                                                onChange={(e) =>
                                                    setStartTime(
                                                        e.target.value
                                                    )
                                                }
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Label
                                            text="Hora de fin"
                                            htmlFor="end_time"
                                        />
                                        <div className="mt-1">
                                            <Input
                                                id="end_time"
                                                type="time"
                                                value={endTime}
                                                onChange={(e) =>
                                                    setEndTime(e.target.value)
                                                }
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 pt-2">
                                    <Button variant="primary" type="submit">
                                        {editingId
                                            ? "Guardar cambios"
                                            : "Agregar franja"}
                                    </Button>
                                    {editingId && (
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={resetForm}
                                        >
                                            Cancelar
                                        </Button>
                                    )}
                                </div>
                            </form>

                            <Text variant="h3" color="primary">
                                Franjas registradas
                            </Text>

                            <div className="mt-4 overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Equipo
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Día
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Inicio
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Fin
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Acciones
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {availabilities.map((availability) => (
                                            <tr
                                                key={availability.id}
                                                className="hover:bg-gray-50 transition-colors"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                                                    {availability.team
                                                        ?.name_team || "-"}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                    {dayLabel(
                                                        availability.date,
                                                        fixture
                                                    )}{" "}
                                                    (
                                                    {formatDate(
                                                        availability.date
                                                    )}
                                                    )
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                    {formatTime(
                                                        availability.start_time
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                    {formatTime(
                                                        availability.end_time
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            variant="secondary"
                                                            size="sm"
                                                            onClick={() =>
                                                                handleEdit(
                                                                    availability
                                                                )
                                                            }
                                                        >
                                                            Editar
                                                        </Button>
                                                        <Button
                                                            variant="danger"
                                                            size="sm"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    availability.id
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

                            {availabilities.length === 0 && (
                                <div className="text-center py-8">
                                    <Text variant="p" color="secondary">
                                        Todavía no hay franjas registradas.
                                    </Text>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
