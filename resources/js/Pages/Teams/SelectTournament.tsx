import { ButtonLink } from '@/Components/Atoms/Button/Button';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Select, Text } from '@/Components/Atoms';

export default function SelectTournament({ tournaments }: { tournaments: { id: number; name_tournament: string }[] }) {
    return <AuthenticatedLayout header={<Text variant="h2" color="primary">Equipos por torneo</Text>}>
        <Head title="Seleccionar torneo" />
        <main className="mx-auto my-10 max-w-4xl space-y-5 rounded-lg bg-white p-8 shadow">
            <h1 className="text-xl font-semibold">Seleccioná un torneo</h1>
            {tournaments.length === 0 && <p>Todavía no hay torneos. <ButtonLink size="sm" href="/tournaments/create">Crear torneo</ButtonLink></p>}
            {tournaments.length > 0 &&
                <Select aria-label="Torneo" value="" onChange={e => {
                    if (e.target.value) router.visit('/tournaments/' + e.target.value + '/categories');
                }}>
                    <option value="">Seleccioná un torneo</option>
                    {tournaments.map(t => <option key={t.id} value={t.id}>{t.name_tournament}</option>)}
                </Select>
            }
        </main>
    </AuthenticatedLayout>;
}
