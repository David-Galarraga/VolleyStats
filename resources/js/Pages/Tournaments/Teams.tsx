import { confirmAction } from '@/Components/ConfirmationProvider';
import React from "react";
import { Head, Link, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Button, Icon, Select, Text } from "@/Components/Atoms";

interface Category {
    id_category: number;
    name_category: string;
    genero_category: string;
    pivot: { number_teams: number | null };
}

interface Team {
    id: number;
    name_team: string;
    city_team: string;
    id_category: number;
    category?: { id_category: number; name_category: string; genero_category: string };
}

interface Tournament {
    id: number;
    name_tournament: string;
}

interface Props {
    tournament: Tournament;
    categories: Category[];
    enrolled: Team[];
    availableTeams: Team[];
}

export default function Teams({ tournament, categories, enrolled, availableTeams }: Props) {
    const [categoryId, setCategoryId] = React.useState<number | "">("");
    const [teamId, setTeamId] = React.useState<number | "">("");

    const filteredAvailable = availableTeams.filter((team) =>
        categoryId === "" ? true : team.id_category === categoryId
    );

    const enroll = (event: React.FormEvent) => {
        event.preventDefault();
        if (!teamId) return;
        router.post(`/tournaments/${tournament.id}/teams`, { id_team: teamId });
    };

    const remove = async (team: Team) => {
        if (await confirmAction(`¿Desinscribir a ${team.name_team} de este torneo?`)) {
            router.delete(`/tournaments/${tournament.id}/teams/${team.id}`);
        }
    };

    const enrolledByCategory = categories.map((category) => ({
        category,
        teams: enrolled.filter((team) => team.id_category === category.id_category),
    }));

    return (
        <AuthenticatedLayout header={<Text variant="h2" color="primary">Equipos · {tournament.name_tournament}</Text>}>
            <Head title={`Equipos — ${tournament.name_tournament}`} />
            <div className="py-12">
                <div className="mx-auto max-w-5xl space-y-6 sm:px-6 lg:px-8">
                    <section className="rounded-lg border-t-4 border-yellow-400 bg-white p-6 shadow-md sm:p-8">
                        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                            <Link href={`/tournaments/${tournament.id}`}>
                                <Button variant="secondary" size="sm"><Icon name="chevronLeft" size="sm" /> Volver al torneo</Button>
                            </Link>
                        </div>

                        <h3 className="mb-4 text-lg font-semibold text-slate-900">Equipos inscritos</h3>
                        {enrolled.length ? (
                            <div className="space-y-6">
                                {enrolledByCategory.map(({ category, teams }) => (
                                    <div key={category.id_category}>
                                        <h4 className="mb-2 text-sm font-semibold text-slate-700">
                                            {category.genero_category} {category.name_category} — {teams.length}/{category.pivot.number_teams ?? "∞"}
                                        </h4>
                                        <ul className="divide-y divide-slate-200 rounded-md border border-slate-200">
                                            {teams.map((team) => (
                                                <li key={team.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm text-slate-700">
                                                    <span>{team.name_team} <span className="text-slate-500">({team.city_team})</span></span>
                                                    <Button variant="danger" size="sm" onClick={() => remove(team)}>Desinscribir</Button>
                                                </li>
                                            ))}
                                            {teams.length === 0 && (
                                                <li className="px-4 py-3 text-sm text-slate-500">Sin equipos inscritos.</li>
                                            )}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-600">Este torneo todavía no tiene equipos inscritos.</p>
                        )}
                    </section>

                    <section className="rounded-lg border-t-4 border-yellow-400 bg-white p-6 shadow-md sm:p-8">
                        <h3 className="mb-4 text-lg font-semibold text-slate-900">Inscribir equipo</h3>
                        {availableTeams.length ? (
                            <form onSubmit={enroll} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Categoría</label>
                                    <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value === "" ? "" : Number(e.target.value))} className="mt-1">
                                        <option value="">Todas las categorías del torneo</option>
                                        {categories.map((category) => (
                                            <option key={category.id_category} value={category.id_category}>
                                                {category.genero_category} {category.name_category}
                                            </option>
                                        ))}
                                    </Select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Equipo</label>
                                    <Select value={teamId} onChange={(e) => setTeamId(e.target.value === "" ? "" : Number(e.target.value))} required className="mt-1">
                                        <option value="">Seleccioná un equipo</option>
                                        {filteredAvailable.map((team) => (
                                            <option key={team.id} value={team.id}>
                                                {team.name_team} — {team.category?.genero_category} {team.category?.name_category}
                                            </option>
                                        ))}
                                    </Select>
                                </div>
                                <Button type="submit">Inscribir</Button>
                            </form>
                        ) : (
                            <p className="text-sm text-slate-600">No hay equipos disponibles para inscribir.</p>
                        )}
                    </section>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
