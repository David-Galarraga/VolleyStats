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
    name_category: string;
    genero_category: string;
}

interface Tournament {
    id: number;
    name_tournament: string;
    start_date: string;
    end_date: string;
    status_tournament: string | null;
    categories: TournamentCategory[];
}

interface TournamentCategory {
    id_category: number;
    number_matches: number | "";
    number_teams: number | "";
}

interface Props {
    tournament: Tournament;
    categories: Category[];
}

export default function Edit({ tournament, categories }: Props) {

    const [nameTournament, setNameTournament] = React.useState(
        tournament.name_tournament
    );

    const [startDate, setStartDate] = React.useState(tournament.start_date);
    const [endDate, setEndDate] = React.useState(tournament.end_date);

    const [tournamentCategories, setTournamentCategories] = 
        React.useState<TournamentCategory[]>(

            tournament.categories.map((category) => ({
                id_category: category.id_category,
                number_teams: category.number_teams ?? "",
                number_matches: category.number_matches ?? "",
            }))

        );
      
    const [statusTournament, setStatusTournament] = React.useState(
        tournament.status_tournament ?? "scheduled"
    );
    const today = todayIso();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        router.put(`/tournaments/${tournament.id}`, {
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
                                className="space-y-6 max-w-xl">
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
                                    <Label
                                        text="Categorías"
                                        htmlFor="categories"
                                    />

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
                                                            {category.name_category} (
                                                            {category.genero_category})
                                                        </span>
                                                    </label>

                                                    {selected && (
                                                        <div className="mt-3 grid grid-cols-2 gap-4">
                                                            <div>
                                                                <Label text="Número de equipos" />

                                                                <div className="mt-1">
                                                                    <Input
                                                                        type="number"
                                                                        min={0}
                                                                        value={selected.number_teams}
                                                                        onChange={(e) => {
                                                                            const value =
                                                                                e.target.value === ""
                                                                                    ? ""
                                                                                    : Number(
                                                                                        e.target.value
                                                                                    );

                                                                            setTournamentCategories(
                                                                                tournamentCategories.map(
                                                                                    (item) =>
                                                                                        item.id_category ===
                                                                                        category.id_category
                                                                                            ? {
                                                                                                ...item,
                                                                                                number_teams:
                                                                                                    value,
                                                                                            }
                                                                                            : item
                                                                                )
                                                                            );
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div>
                                                                <Label text="Número de partidos" />

                                                                <div className="mt-1">
                                                                    <Input
                                                                        type="number"
                                                                        min={0}
                                                                        value={selected.number_matches}
                                                                        onChange={(e) => {
                                                                            const value =
                                                                                e.target.value === ""
                                                                                    ? ""
                                                                                    : Number(
                                                                                        e.target.value
                                                                                    );

                                                                            setTournamentCategories(
                                                                                tournamentCategories.map(
                                                                                    (item) =>
                                                                                        item.id_category ===
                                                                                        category.id_category
                                                                                            ? {
                                                                                                ...item,
                                                                                                number_matches:
                                                                                                    value,
                                                                                            }
                                                                                            : item
                                                                                )
                                                                            );
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
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
                            
                            <div className="flex items-center gap-4 pt-4">
                                <Button
                                    variant="primary"
                                    type="submit"
                                >
                                    Guardar cambios
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
