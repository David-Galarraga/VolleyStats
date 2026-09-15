import React from "react";
import { router } from "@inertiajs/react";
import { Link, Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Button, Text, Input, Label, Icon, DateInput } from "@/Components/Atoms";
import FormErrors from "@/Components/FormErrors";

interface Tournament {
    id: number;
    name_tournament: string;
}

interface Fixture {
    id: number;
    id_tournament: number;
    name_fixture: string;
    start_date: string;
    end_date: string;
    status_fixture: string;
}

interface Props {
    fixture: Fixture;
    tournaments: Tournament[];
}

const addOneDay = (iso: string): string => {
    if (!iso) return "";
    const date = new Date(`${iso}T00:00:00`);
    date.setDate(date.getDate() + 1);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const formatDate = (iso: string) => {
    if (!iso) return "-";
    const [year, month, day] = iso.split("-");
    return `${day}/${month}/${year}`;
};

export default function Edit({ fixture, tournaments }: Props) {
    const [idTournament, setIdTournament] = React.useState<number | "">(
        fixture.id_tournament
    );
    const [nameFixture, setNameFixture] = React.useState(fixture.name_fixture);
    const [startDate, setStartDate] = React.useState(fixture.start_date);
    const [statusFixture, setStatusFixture] = React.useState(
        fixture.status_fixture || "scheduled"
    );

    const endDate = addOneDay(startDate);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        router.put(`/fixtures/${fixture.id}`, {
            id_tournament: idTournament,
            name_fixture: nameFixture,
            start_date: startDate,
            end_date: endDate,
            status_fixture: statusFixture || "scheduled",
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <Text variant="h2" color="primary">
                    Editar Fixture
                </Text>
            }
        >
            <Head title="Editar Fixture" />

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
                                        text="Nombre del fixture"
                                        htmlFor="name_fixture"
                                    />
                                    <div className="mt-1">
                                        <Input
                                            id="name_fixture"
                                            type="text"
                                            value={nameFixture}
                                            onChange={(e) =>
                                                setNameFixture(e.target.value)
                                            }
                                            placeholder="Ej: Fecha 1"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label
                                        text="Sábado"
                                        htmlFor="start_date"
                                    />
                                    <div className="mt-1">
                                        <DateInput
                                            id="start_date"
                                            value={startDate}
                                            onChange={(iso) =>
                                                setStartDate(iso)
                                            }
                                            required
                                        />
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500">
                                        Seleccione el sábado del fin de semana.
                                    </p>
                                </div>

                                <div>
                                    <Label
                                        text="Domingo"
                                        htmlFor="end_date"
                                    />
                                    <div className="mt-1 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600">
                                        {startDate
                                            ? formatDate(endDate)
                                            : "Se completa automáticamente"}
                                    </div>
                                </div>

                                <div>
                                    <Label
                                        text="Estado del fixture"
                                        htmlFor="status_fixture"
                                    />
                                    <div className="mt-1">
                                        <select
                                            id="status_fixture"
                                            value={statusFixture}
                                            onChange={(e) =>
                                                setStatusFixture(
                                                    e.target.value
                                                )
                                            }
                                            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400"
                                        >
                                            <option value="scheduled">
                                                Programado
                                            </option>
                                            <option value="in_progress">
                                                En curso
                                            </option>
                                            <option value="finished">
                                                Finalizado
                                            </option>
                                            <option value="canceled">
                                                Cancelado
                                            </option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 pt-4">
                                    <Button variant="primary" type="submit">
                                        Guardar cambios
                                    </Button>
                                    <Link href="/fixtures">
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
