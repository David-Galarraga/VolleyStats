import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Input, Select, Text } from '@/Components/Atoms';

export default function SelectTournament({ tournaments }: { tournaments: { id: number; name_tournament: string }[] }) {
    const [search, setSearch] = useState('');
    const matching = tournaments.filter(t => t.name_tournament.toLowerCase().includes(search.trim().toLowerCase()));
    return <AuthenticatedLayout header={<Text variant="h2" color="primary">Equipos por torneo</Text>}>
        <Head title="Seleccionar torneo" />
        <main className="mx-auto my-10 max-w-4xl space-y-5 rounded-lg bg-white p-8 shadow">
            <h1 className="text-xl font-semibold">Seleccioná un torneo</h1>
            {tournaments.length === 0 && <p>Todavía no hay torneos. <Link className="text-blue-700 underline" href="/tournaments/create">Crear torneo</Link></p>}
            {tournaments.length > 0 && <>
                <Input type="search" aria-label="Buscar torneo por nombre" placeholder="Buscar por nombre" value={search} onChange={e => setSearch(e.target.value)} />
                <Select aria-label="Torneo" value="" onChange={e => {
                    if (e.target.value) router.visit('/tournaments/' + e.target.value + '/categories');
                }}>
                    <option value="">{matching.length ? 'Seleccioná un torneo' : 'No se encontraron torneos'}</option>
                    {matching.map(t => <option key={t.id} value={t.id}>{t.name_tournament}</option>)}
                </Select>
            </>}
        </main>
    </AuthenticatedLayout>;
}
