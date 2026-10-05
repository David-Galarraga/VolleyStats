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
    todayIso,
} from "@/Components/Atoms";
import FormErrors from "@/Components/FormErrors";

interface Category {
    id_category: number;
    name_category: string ;
    genero_category: string;
}

interface  TournamentCategory {
    id_category: number;
    number_matches: number | "";
    number_teams: number | "";
}

interface Props {
    categories: Category[];
}

export default function Create({ categories }: Props) {
    const [nameTournament, setNameTournament] = React.useState("");
    
    const [startDate, setStartDate] = React.useState("");
    const [endDate, setEndDate] = React.useState("");

    const[tournamentCategories, setTournamentCategories] = 
        React.useState<TournamentCategory[]>([]);
    
    const [statusTournament, setStatusTournament] =
        React.useState("scheduled");

    const today = todayIso();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        router.post("/tournaments", {
            name_tournament: nameTournament,
            start_date: startDate,
            end_date: endDate,
            status_tournament: statusTournament || null,
            categories: tournamentCategories.map((category) => ({
                id_category: category.id_category,
                number_matches: category.number_matches,
                number_teams: category.number_teams,
            })),
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <Text variant="h2" color="primary">
                    Crear Torneo
                </Text>
            }
        >
            <Head title="Crear Torneo" />

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
                                    <Label text="Categorías" />

                                    <div className="mt-2 space-y-3">
                                        {categories.map((category) => {
                                            const selected = tournamentCategories.find(
                                                (item) => item.id_category === category.id_category
                                            );

                                    return (
                                        <div
                                            key={category.id_category}
                                            className="rounded-md border border-gray-300 p-4"
                                        >
                                            <label className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={!!selected}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setTournamentCategories([
                                                            ...tournamentCategories,
                                                            {
                                                                id_category:
                                                                    category.id_category,
                                                                number_matches: "",
                                                                number_teams: "",
                                                            },
                                                        ]);
                                                    } else {
                                                        setTournamentCategories(
                                                            tournamentCategories.filter(
                                                                (item) =>
                                                                    item.id_category !==
                                                                    category.id_category
                                                            )
                                                        );
                                                    }
                                                }}
                                            />

                                            <span className="text-sm font-medium text-gray-900">
                                                    {category.name_category} ({category.genero_category})
                                                </span>

                                                {selected && (
                                                    <div className="mt-3 ml-6 space-y-3">
                                                        <div>
                                                            <Label
                                                                text="Número de partidos"
                                                                htmlFor={`number_matches_${category.id_category}`}
                                                            />
                                                            <Input
                                                                id={`number_matches_${category.id_category}`}
                                                                type="number"
                                                                min="0"
                                                                value={selected.number_matches}
                                                                onChange={(e) => {
                                                                    const value =
                                                                        e.target.value === ""
                                                                            ? ""
                                                                            : Number(e.target.value);

                                                                    setTournamentCategories(
                                                                        tournamentCategories.map((item) =>
                                                                            item.id_category === category.id_category
                                                                                ? {
                                                                                    ...item,
                                                                                    number_matches: value,
                                                                                }
                                                                                : item
                                                                        )
                                                                    );
                                                                }}
                                                                required
                                                            />
                                                        </div>

                                                        <div>
                                                            <Label
                                                                text="Número de equipos"
                                                                htmlFor={`number_teams_${category.id_category}`}
                                                            />
                                                            <Input
                                                                id={`number_teams_${category.id_category}`}
                                                                type="number"
                                                                min="0"
                                                                value={selected.number_teams}
                                                                onChange={(e) => {
                                                                    const value =
                                                                        e.target.value === ""
                                                                            ? ""
                                                                            : Number(e.target.value);

                                                                    setTournamentCategories(
                                                                        tournamentCategories.map((item) =>
                                                                            item.id_category === category.id_category
                                                                                ? {
                                                                                    ...item,
                                                                                    number_teams: value,
                                                                                }
                                                                                : item
                                                                        )
                                                                    );
                                                                }}
                                                                required
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            
                                        </label>
                                    </div>
                                );
                            })}
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
                                            min={today}
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
                                            min={startDate || today}
                                            value={endDate}
                                            onChange={(iso) =>
                                                setEndDate(iso)
                                            }
                                            required
                                        />
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
                                        Crear torneo
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
