import { Head, Link } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Button, Icon, Text } from "@/Components/Atoms";

interface Category {
    id_category: number;
    name_category: string;
    genero_category: string;
    pivot: { number_teams: number | null };
}

interface Tournament {
    id: number;
    name_tournament: string;
    start_date: string;
    end_date: string;
    status_tournament: string | null;
    categories: Category[];
}

const statusLabels: Record<string, string> = {
    scheduled: "Programado",
    in_progress: "En curso",
    finished: "Finalizado",
    canceled: "Cancelado",
};

export default function Show({ tournament }: { tournament: Tournament }) {
    return (
        <AuthenticatedLayout header={<Text variant="h2" color="primary">{tournament.name_tournament}</Text>}>
            <Head title={tournament.name_tournament} />
            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <section className="overflow-hidden rounded-lg border-t-4 border-yellow-400 bg-white shadow-md">
                        <div className="space-y-6 p-8">
                            <div className="flex flex-wrap justify-between gap-3">
                                <Link href="/tournaments"><Button variant="secondary" size="sm"><Icon name="chevronLeft" size="sm" /> Volver a torneos</Button></Link>
                                <Link href={`/tournaments/${tournament.id}/categories`}><Button variant="primary" size="md">Gestionar categorías</Button></Link>
                            </div>
                            <dl className="grid gap-5 sm:grid-cols-3">
                                <div><dt className="text-sm font-medium text-slate-500">Inicio</dt><dd className="mt-1 text-base text-slate-900">{tournament.start_date}</dd></div>
                                <div><dt className="text-sm font-medium text-slate-500">Fin</dt><dd className="mt-1 text-base text-slate-900">{tournament.end_date}</dd></div>
                                <div><dt className="text-sm font-medium text-slate-500">Estado</dt><dd className="mt-1 text-base text-slate-900">{tournament.status_tournament ? statusLabels[tournament.status_tournament] || tournament.status_tournament : "-"}</dd></div>
                            </dl>
                            <div>
                                <h3 className="mb-3 text-lg font-semibold text-slate-900">Categorías</h3>
                                {tournament.categories.length ? (
                                    <ul className="divide-y divide-slate-200 rounded-md border border-slate-200">
                                        {tournament.categories.map((category) => (
                                            <li key={category.id_category} className="flex flex-wrap justify-between gap-2 px-4 py-3 text-sm text-slate-700">
                                                <span>{category.genero_category} {category.name_category}</span>
                                                <span>
                                                    — {category.pivot.number_teams === null
                                                        ? "Cantidad sin definir"
                                                        : `${category.pivot.number_teams} ${category.pivot.number_teams === 1 ? "equipo" : "equipos"}`}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : <p className="text-sm text-slate-600">Este torneo no tiene categorías asociadas.</p>}
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
