import React from "react";
import { Head, Link, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Button, Icon, Input, Label, Text } from "@/Components/Atoms";
import FormErrors from "@/Components/FormErrors";

interface Category {
    id_category: number;
    name_category: string;
    genero_category: string;
    pivot?: { number_matches: number | null; number_teams: number | null };
}

interface Tournament {
    id: number;
    name_tournament: string;
}

interface Props {
    tournament: Tournament;
    categories: Category[];
    availableCategories: Category[];
}

function TournamentCategoryRow({ tournament, category }: { tournament: Tournament; category: Category }) {
    const [editing, setEditing] = React.useState(false);
    const [name, setName] = React.useState(category.name_category);
    const [gender, setGender] = React.useState(category.genero_category);
    const [matches, setMatches] = React.useState<number | "">(category.pivot?.number_matches ?? "");
    const [teams, setTeams] = React.useState<number | "">(category.pivot?.number_teams ?? "");

    const save = (event: React.FormEvent) => {
        event.preventDefault();
        router.put(`/tournaments/${tournament.id}/categories/${category.id_category}`, {
            name_category: name,
            genero_category: gender,
            number_matches: matches,
            number_teams: teams,
        });
    };

    const detach = () => {
        if (confirm(`¿Quitar ${category.name_category} de este torneo? La categoría global se conservará.`)) {
            router.delete(`/tournaments/${tournament.id}/categories/${category.id_category}`);
        }
    };

    return (
        <li className="p-5">
            {editing ? (
                <form onSubmit={save} className="grid gap-4 md:grid-cols-2">
                    <div><Label text="Nombre de categoría" /><Input value={name} onChange={(event) => setName(event.target.value)} required /></div>
                    <div><Label text="Género" /><Input value={gender} onChange={(event) => setGender(event.target.value)} required /></div>
                    <div><Label text="Partidos previstos" /><Input type="number" min={0} value={matches} onChange={(event) => setMatches(event.target.value === "" ? "" : Number(event.target.value))} /></div>
                    <div><Label text="Equipos previstos" /><Input type="number" min={0} value={teams} onChange={(event) => setTeams(event.target.value === "" ? "" : Number(event.target.value))} /></div>
                    <div className="flex gap-2 md:col-span-2">
                        <Button type="submit">Guardar cambios</Button>
                        <Button variant="secondary" onClick={() => setEditing(false)}>Cancelar</Button>
                    </div>
                </form>
            ) : (
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <p className="font-medium text-slate-900">{category.genero_category} {category.name_category}</p>
                        <p className="mt-1 text-sm text-slate-600">
                            {category.pivot?.number_teams ?? "Sin definir"} equipos · {category.pivot?.number_matches ?? "Sin definir"} partidos previstos
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>Editar datos</Button>
                        <Button variant="danger" size="sm" onClick={detach}>Quitar del torneo</Button>
                    </div>
                </div>
            )}
        </li>
    );
}

export default function Categories({ tournament, categories, availableCategories }: Props) {
    const [categoryId, setCategoryId] = React.useState<number | "">("");
    const [matches, setMatches] = React.useState<number | "">("");
    const [teams, setTeams] = React.useState<number | "">("");
    const [name, setName] = React.useState("");
    const [gender, setGender] = React.useState("");

    const associate = (event: React.FormEvent) => {
        event.preventDefault();
        router.post(`/tournaments/${tournament.id}/categories`, {
            id_category: categoryId,
            number_matches: matches,
            number_teams: teams,
        });
    };

    const createAndAssociate = (event: React.FormEvent) => {
        event.preventDefault();
        router.post(`/tournaments/${tournament.id}/categories`, {
            name_category: name,
            genero_category: gender,
            number_matches: matches,
            number_teams: teams,
        });
    };

    return (
        <AuthenticatedLayout header={<Text variant="h2" color="primary">Categorías · {tournament.name_tournament}</Text>}>
            <Head title={`Categorías — ${tournament.name_tournament}`} />
            <div className="py-12">
                <div className="mx-auto max-w-5xl space-y-6 sm:px-6 lg:px-8">
                    <section className="rounded-lg border-t-4 border-yellow-400 bg-white p-6 shadow-md sm:p-8">
                        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                            <Link href={`/tournaments/${tournament.id}`}>
                                <Button variant="secondary" size="sm"><Icon name="chevronLeft" size="sm" /> Volver al torneo</Button>
                            </Link>
                        </div>
                        <h3 className="mb-4 text-lg font-semibold text-slate-900">Categorías vinculadas</h3>
                        <p className="mb-4 text-sm text-slate-600">Editar nombre o género cambia la categoría global y se verá en todos los torneos que la compartan. Quitar del torneo solo elimina este vínculo.</p>
                        <FormErrors />
                        {categories.length ? (
                            <ul className="divide-y divide-slate-200 rounded-md border border-slate-200">
                                {categories.map((category) => <TournamentCategoryRow key={category.id_category} tournament={tournament} category={category} />)}
                            </ul>
                        ) : <p className="text-sm text-slate-600">Este torneo todavía no tiene categorías.</p>}
                    </section>

                    <section className="grid gap-6 md:grid-cols-2">
                        <div className="rounded-lg border-t-4 border-yellow-400 bg-white p-6 shadow-md sm:p-8">
                            <h3 className="mb-4 text-lg font-semibold text-slate-900">Asociar categoría existente</h3>
                            {availableCategories.length ? (
                                <form onSubmit={associate} className="space-y-4">
                                    <div>
                                        <Label text="Categoría" htmlFor="category_id" />
                                        <select id="category_id" value={categoryId} onChange={(event) => setCategoryId(Number(event.target.value))} required className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm">
                                            <option value="">Seleccioná una categoría</option>
                                            {availableCategories.map((category) => <option key={category.id_category} value={category.id_category}>{category.genero_category} {category.name_category}</option>)}
                                        </select>
                                    </div>
                                    <div><Label text="Partidos previstos" /><Input type="number" min={0} value={matches} onChange={(event) => setMatches(event.target.value === "" ? "" : Number(event.target.value))} /></div>
                                    <div><Label text="Equipos previstos" /><Input type="number" min={0} value={teams} onChange={(event) => setTeams(event.target.value === "" ? "" : Number(event.target.value))} /></div>
                                    <Button type="submit">Asociar al torneo</Button>
                                </form>
                            ) : <p className="text-sm text-slate-600">No hay otras categorías globales disponibles para asociar.</p>}
                        </div>

                        <div className="rounded-lg border-t-4 border-yellow-400 bg-white p-6 shadow-md sm:p-8">
                            <h3 className="mb-4 text-lg font-semibold text-slate-900">Crear categoría para este torneo</h3>
                            <form onSubmit={createAndAssociate} className="space-y-4">
                                <div><Label text="Nombre de categoría" htmlFor="name_category" /><Input id="name_category" value={name} onChange={(event) => setName(event.target.value)} required maxLength={50} /></div>
                                <div><Label text="Género" htmlFor="genero_category" /><Input id="genero_category" value={gender} onChange={(event) => setGender(event.target.value)} required maxLength={50} /></div>
                                <div><Label text="Partidos previstos" /><Input type="number" min={0} value={matches} onChange={(event) => setMatches(event.target.value === "" ? "" : Number(event.target.value))} /></div>
                                <div><Label text="Equipos previstos" /><Input type="number" min={0} value={teams} onChange={(event) => setTeams(event.target.value === "" ? "" : Number(event.target.value))} /></div>
                                <Button type="submit">Crear y asociar</Button>
                            </form>
                        </div>
                    </section>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
