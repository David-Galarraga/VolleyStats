import { Head, Link } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Button, Icon, Text } from "@/Components/Atoms";

interface Team {
    id: number;
    name_team: string;
    city_team: string;
    category?: { name_category: string; genero_category: string } | null;
    delegate?: { name_delegate: string } | null;
}

export default function Show({ team }: { team: Team }) {
    const category = team.category
        ? `${team.category.name_category} (${team.category.genero_category})`
        : "Sin categoría asignada";

    return (
        <AuthenticatedLayout header={<Text variant="h2" color="primary">{team.name_team}</Text>}>
            <Head title={team.name_team} />
            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <section className="overflow-hidden rounded-lg border-t-4 border-yellow-400 bg-white shadow-md">
                        <div className="space-y-6 p-8">
                            <Link href="/teams">
                                <Button variant="secondary" size="sm"><Icon name="chevronLeft" size="sm" /> Volver a equipos</Button>
                            </Link>
                            <dl className="grid gap-5 sm:grid-cols-2">
                                <div><dt className="text-sm font-medium text-slate-500">Equipo</dt><dd className="mt-1 text-base text-slate-900">{team.name_team}</dd></div>
                                <div><dt className="text-sm font-medium text-slate-500">Ciudad</dt><dd className="mt-1 text-base text-slate-900">{team.city_team || "-"}</dd></div>
                                <div><dt className="text-sm font-medium text-slate-500">Delegado</dt><dd className="mt-1 text-base text-slate-900">{team.delegate?.name_delegate || "Sin delegado asignado"}</dd></div>
                                <div><dt className="text-sm font-medium text-slate-500">Categoría</dt><dd className="mt-1 text-base text-slate-900">{category}</dd></div>
                            </dl>
                            <Link href={`/teams/${team.id}/players`}>
                                <Button variant="primary" size="md">Ver jugadores/as</Button>
                            </Link>
                        </div>
                    </section>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
