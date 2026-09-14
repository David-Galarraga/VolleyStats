import React from "react";
import { router } from "@inertiajs/react";
import { Link, Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import {
    Button,
    Text,
    Input,
    Label,
    Icon,
    DateInput,
} from "@/Components/Atoms";

interface Category {
    id_category: number;
    name_category: string;
    genero_category: string;
}

interface Tournament {
    id: number;
    id_category: number;
    name_tournament: string;
    start_date: string;
    end_date: string;
    number_matches: number | null;
    number_teams: number | null;
    status_tournament: string | null;
}

interface Props {
    tournament: Tournament;
    categories: Category[];
}

export default function Edit({ tournament, categories }: Props) {
    const [nameTournament, setNameTournament] = React.useState(
        tournament.name_tournament
    );
    const [idCategory, setIdCategory] = React.useState<number | "">(
        tournament.id_category
    );
    const [startDate, setStartDate] = React.useState(tournament.start_date);
    const [endDate, setEndDate] = React.useState(tournament.end_date);
    const [numberMatches, setNumberMatches] = React.useState<number | "">(
        tournament.number_matches ?? ""
    );
    const [numberTeams, setNumberTeams] = React.useState<number | "">(
        tournament.number_teams ?? ""
    );
    const [statusTournament, setStatusTournament] = React.useState(
        tournament.status_tournament ?? "scheduled"
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        router.put(`/tournaments/${tournament.id}`, {
            name_tournament: nameTournament,
            id_category: idCategory,
            start_date: startDate,
            end_date: endDate,
            number_matches: numberMatches === "" ? null : numberMatches,
            number_teams: numberTeams === "" ? null : numberTeams,
            status_tournament: statusTournament || null,
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <Text variant="h2" color="primary">
                    Editar Torneo
                </Text>
            }
        >
            <Head title="Editar Torneo" />

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
                                        text="Nombre del torneo"
                                        htmlFor="name_tournament"
                                    />
                                    <div className="mt-1">
                                        <Input
                                            id="name_tournament"
                                            type="text"
                                            value={nameTournament}
                                            onChange={(e) =>
                                                setNameTournament(
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Ingrese el nombre del torneo"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label
                                        text="Categoría"
                                        htmlFor="id_category"
                                    />
                                    <div className="mt-1">
                                        <select
                                            id="id_category"
                                            value={idCategory}
                                            onChange={(e) =>
                                                setIdCategory(
                                                    Number(e.target.value)
                                                )
                                            }
                                            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400"
                                            required
                                        >
                                            <option value="">
                                                Seleccione una categoría
                                            </option>
                                            {categories.map((cat) => (
                                                <option
                                                    key={cat.id_category}
                                                    value={cat.id_category}
                                                >
                                                    {cat.name_category} (
                                                    {cat.genero_category})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <Label
                                        text="Fecha de inicio"
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
                                </div>

                                <div>
                                    <Label
                                        text="Fecha de fin"
                                        htmlFor="end_date"
                                    />
                                    <div className="mt-1">
                                        <DateInput
                                            id="end_date"
                                            value={endDate}
                                            onChange={(iso) =>
                                                setEndDate(iso)
                                            }
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label
                                            text="Número de partidos"
                                            htmlFor="number_matches"
                                        />
                                        <div className="mt-1">
                                            <Input
                                                id="number_matches"
                                                type="number"
                                                min={0}
                                                value={numberMatches}
                                                onChange={(e) =>
                                                    setNumberMatches(
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
                                            text="Número de equipos"
                                            htmlFor="number_teams"
                                        />
                                        <div className="mt-1">
                                            <Input
                                                id="number_teams"
                                                type="number"
                                                min={0}
                                                value={numberTeams}
                                                onChange={(e) =>
                                                    setNumberTeams(
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
                                    <Label
                                        text="Estado del torneo"
                                        htmlFor="status_tournament"
                                    />
                                    <div className="mt-1">
                                        <select
                                            id="status_tournament"
                                            value={statusTournament}
                                            onChange={(e) =>
                                                setStatusTournament(
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
                                        Actualizar
                                    </Button>
                                    <Link href="/tournaments">
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
