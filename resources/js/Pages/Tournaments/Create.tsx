import React from "react";
import { router, usePage } from "@inertiajs/react";
import { Link, Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import {
    Button,
    Text,
    Input,
    Label,
    Select,
    Icon,
    DateInput,
    todayIso,
} from "@/Components/Atoms";
import Modal from "@/Components/Modal";
import { confirmAction } from "@/Components/ConfirmationProvider";
import { RegistrationForm, type PendingTeam } from "../Teams/Registration";
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
    teams: PendingTeam[];
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

    const [editing, setEditing] = React.useState<{ categoryId: number; index: number } | null>(null);
    const [processing, setProcessing] = React.useState(false);
    const errors = usePage().props.errors;
    const categoryIndex = tournamentCategories.findIndex(item => item.id_category === editing?.categoryId);
    const editingCategory = categories.find(item => item.id_category === editing?.categoryId);
    const errorPrefix = 'categories.' + categoryIndex + '.teams.' + editing?.index + '.';
    const teamErrors = Object.fromEntries(Object.entries(errors)
        .filter(([key]) => key.startsWith(errorPrefix))
        .map(([key, value]) => [key.slice(errorPrefix.length), value]));

    const today = todayIso();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (processing) return;
        router.post("/tournaments", {
            name_tournament: nameTournament,
            start_date: startDate,
            end_date: endDate,
            status_tournament: statusTournament || null,
            categories: tournamentCategories.map((category) => ({
                id_category: category.id_category,
                number_matches: category.number_matches,
                number_teams: category.number_teams,
                teams: category.teams,
            })),
        }, {
            onStart: () => setProcessing(true),
            onFinish: () => setProcessing(false),
            onError: errors => {
                const match = Object.keys(errors).join(' ').match(/categories\.(\d+)\.teams\.(\d+)\./);
                if (match) setEditing({ categoryId: tournamentCategories[Number(match[1])].id_category, index: Number(match[2]) });
            },
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
                                                    onChange={async (e) => {
                                                        if (e.target.checked) {
                                                            setTournamentCategories([
                                                            ...tournamentCategories,
                                                            {
                                                                id_category:
                                                                    category.id_category,
                                                                number_matches: "",
                                                                number_teams: "",
                                                                teams: [],
                                                            },
                                                        ]);
                                                    } else {
                                                        if (selected?.teams.length && !await confirmAction("¿Descartar los equipos cargados para esta categoría?")) return;
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

                                            </label>

                                                {selected && (
                                                    <div className="mt-3 ml-6 space-y-3">
                                                        <div>
                                                            <Label
                                                                text="Partidos previstos"
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
                                                                text="Equipos previstos"
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
                                                        <Button type="button" variant="secondary" onClick={() => setEditing({ categoryId: category.id_category, index: selected.teams.length })}>Cargar equipo</Button>
                                                        <ul className="space-y-2">
                                                            {selected.teams.map((team, index) => <li key={index} className="flex flex-wrap items-center gap-2">
                                                                <span>{team.name_team || 'Equipo sin nombre'}</span>
                                                                <Button type="button" size="sm" variant="secondary" onClick={() => setEditing({ categoryId: category.id_category, index })}>Editar</Button>
                                                                <Button type="button" size="sm" variant="danger" onClick={() => setTournamentCategories(current => current.map(item => item.id_category === category.id_category ? { ...item, teams: item.teams.filter((_, position) => position !== index) } : item))}>Quitar</Button>
                                                            </li>)}
                                                        </ul>
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

                                <div>
                                    <Label
                                        text="Estado del torneo"
                                        htmlFor="status_tournament"
                                    />
                                    <div className="mt-1">
                                        <Select
                                            id="status_tournament"
                                            value={statusTournament}
                                            onChange={(e) =>
                                                setStatusTournament(
                                                    e.target.value
                                                )
                                            }
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
                                        </Select>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 pt-4">
                                    <Button variant="primary" type="submit" disabled={processing}>
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
            {editing && editingCategory && categoryIndex >= 0 && <Modal show onClose={() => setEditing(null)}>
                <RegistrationForm
                    key={editing.categoryId + ':' + editing.index}
                    tournament={{ id: 0, name_tournament: nameTournament }}
                    category={editingCategory}
                    team={null}
                    delegates={[]}
                    trainers={[]}
                    local={{
                        team: tournamentCategories[categoryIndex].teams[editing.index],
                        errors: teamErrors,
                        cancel: () => setEditing(null),
                        save: team => {
                            setTournamentCategories(current => current.map(item => {
                                if (item.id_category !== editing.categoryId) return item;
                                const teams = [...item.teams];
                                teams[editing.index] = team;
                                return { ...item, teams };
                            }));
                            setEditing(null);
                        },
                    }}
                />
            </Modal>}
        </AuthenticatedLayout>
    );
}
