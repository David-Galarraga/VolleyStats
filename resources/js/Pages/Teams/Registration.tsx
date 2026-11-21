import { ButtonLink } from '@/Components/Atoms/Button/Button';
import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button, Input, Label, Select, Text } from '@/Components/Atoms';

type Player = { id?: number; name_player: string; dni_player: string; birthdate_player: string; };
type Delegate = { id_delegate?: number; name_delegate: string; dni_delegate: string; phone_delegate: string; email_delegate: string; };
type Trainer = { id_trainer?: number; name_trainer: string; dni_trainer: string; birthdate_trainer: string; };
interface Team { id: number; name_team: string; city_team: string; registration_status: string; delegate: Delegate | null; trainer: Trainer | null; players: Player[]; }
interface Props { tournament: { id: number; name_tournament: string }; category: { id_category: number; name_category: string; genero_category: string }; team: Team | null; delegates: Delegate[]; trainers: Trainer[]; saved?: string | null; }
const blankPlayer = (): Player => ({ name_player: '', dni_player: '', birthdate_player: '' });
const blankDelegate = (): Delegate => ({ name_delegate: '', dni_delegate: '', phone_delegate: '', email_delegate: '' });
const blankTrainer = (): Trainer => ({ name_trainer: '', dni_trainer: '', birthdate_trainer: '' });

export type PendingTeam = {
    name_team: string;
    city_team: string;
    delegate: Delegate;
    trainer: Trainer | null;
    players: Player[];
};

interface LocalRegistration {
    team?: PendingTeam;
    errors: Record<string, string>;
    save: (team: PendingTeam) => void;
    cancel: () => void;
}

export default function Registration(props: Props) {
    return <AuthenticatedLayout header={<Text variant="h2" color="primary">{props.team ? 'Completar equipo' : 'Agregar equipo'}</Text>}>
        <Head title={props.team ? 'Equipo ' + props.team.name_team : 'Agregar equipo'} />
        <RegistrationForm {...props} />
    </AuthenticatedLayout>;
}

export function RegistrationForm({ tournament, category, team, delegates, trainers, saved, local }: Props & { local?: LocalRegistration }) {
    const initial = local?.team ?? team;
    const base = `/tournaments/${tournament.id}/categories/${category.id_category}/teams`;
    const form = useForm({
        name_team: initial?.name_team ?? '', city_team: initial?.city_team ?? 'Gualeguaychú',
        id_delegate: '', id_trainer: '', new_delegate: false, new_trainer: false, delegate: { ...blankDelegate(), ...initial?.delegate },
        trainer: { ...blankTrainer(), ...initial?.trainer, birthdate_trainer: initial?.trainer?.birthdate_trainer?.slice(0, 10) ?? '' },
        players: (initial?.players ?? []).map(p => ({ ...p, birthdate_player: p.birthdate_player.slice(0, 10) })),
    });
    const [trainerEnabled, setTrainerEnabled] = React.useState(!!initial?.trainer);
    const confirmed = team?.registration_status === 'confirmed';
    const completePlayers = form.data.players.filter(p => p.name_player.trim() && /^[0-9]{8}$/.test(p.dni_player.replaceAll('.', '').trim()) && p.birthdate_player).length;
    const errors = local?.errors ?? form.errors as Record<string, string>;
    const error = (key: string) => errors[key] ? <p className="mt-1 text-sm text-red-700" role="alert">{errors[key]}</p> : null;
    const submit = (action: 'draft' | 'confirm') => {
        if (local) {
            local.save({
                name_team: form.data.name_team,
                city_team: form.data.city_team,
                delegate: form.data.delegate,
                trainer: trainerEnabled ? form.data.trainer : null,
                players: form.data.players,
            });
            return;
        }
        form.transform(data => ({ ...data, action, id_delegate: data.id_delegate || null, id_trainer: trainerEnabled ? data.id_trainer || null : null, trainer: trainerEnabled ? data.trainer : null }));
        if (team) form.put(`${base}/${team.id}`, { preserveScroll: true, preserveState: 'errors' }); else form.post(base, { preserveScroll: true, preserveState: 'errors' });
    };
    return <main className={local ? 'max-h-[80vh] space-y-6 overflow-y-auto p-6' : 'mx-auto my-10 max-w-5xl space-y-6 rounded-lg bg-white p-6 shadow sm:p-8'}>
            {!local && <ButtonLink variant="secondary" size="sm" href={base}>Volver a equipos</ButtonLink>}
            {local && <h2 className="text-xl font-semibold">Cargar equipo · {category.name_category}</h2>}
            {!local && <div><h1 className="text-xl font-semibold">{tournament.name_tournament}</h1><p>{category.name_category} · {category.genero_category}</p><p className="mt-2 text-sm">{confirmed ? 'Inscripción confirmada. El equipo debe conservar delegado y al menos ocho jugadoras.' : `${team?.registration_status === 'legacy_review' ? 'Histórico pendiente de revisión' : 'Borrador'}: delegado obligatorio y ${Math.max(0, 8 - completePlayers)} jugadoras pendientes para confirmar.`}</p></div>}
            {saved && <p className="rounded border border-green-300 bg-green-50 p-4 text-green-900" role="status">{saved}</p>}
            {Object.keys(errors).length > 0 && <div className="rounded border border-red-300 bg-red-50 p-4" role="alert"><p className="font-semibold">Revisá los datos antes de guardar:</p><ul className="list-inside list-disc">{Object.entries(errors).map(([key, message]) => <li key={key}>{message}</li>)}</ul></div>}
            <form noValidate onSubmit={e => { e.preventDefault(); submit(confirmed ? 'confirm' : 'draft'); }} className="space-y-8">
                <section className="grid gap-5 sm:grid-cols-2"><div><Label text="Nombre del equipo *" htmlFor="name_team" /><Input id="name_team" value={form.data.name_team} onChange={e => form.setData('name_team', e.target.value)} />{error('name_team')}</div><div><Label text="Ciudad *" htmlFor="city_team" /><Input id="city_team" value={form.data.city_team} onChange={e => form.setData('city_team', e.target.value)} />{error('city_team')}</div></section>
                <section className="space-y-4 rounded border p-5"><h2 className="text-lg font-semibold">Delegado obligatorio</h2><Label text="Delegado del torneo" htmlFor="delegate-select" /><Select id="delegate-select" value={form.data.id_delegate} onChange={e => form.setData('id_delegate', e.target.value)}><option value="">{team?.delegate ? 'Editar delegado actual' : 'Cargar nuevo delegado'}</option>{delegates.map(d => <option key={d.id_delegate} value={d.id_delegate}>{d.name_delegate} · {d.dni_delegate || 'DNI pendiente'}</option>)}</Select>
                    {team?.delegate && !form.data.id_delegate && <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.data.new_delegate} onChange={e => { form.setData('new_delegate', e.target.checked); form.setData('delegate', e.target.checked ? blankDelegate() : { ...blankDelegate(), ...team.delegate }); }} />Reemplazar por un delegado nuevo</label>}
                    {!form.data.id_delegate && <div className="grid gap-4 sm:grid-cols-2">{(['name_delegate', 'dni_delegate', 'phone_delegate', 'email_delegate'] as const).map((key, i) => <div key={key}><Label text={['Nombre completo *', 'DNI *', 'Celular *', 'Correo (opcional)'][i]} htmlFor={key} /><Input id={key} type={key === 'email_delegate' ? 'email' : key === 'phone_delegate' ? 'tel' : 'text'} value={form.data.delegate[key] ?? ''} onChange={e => form.setData('delegate', { ...form.data.delegate, [key]: e.target.value })} />{error(`delegate.${key}`)}</div>)}</div>}
                </section>
                <section className="space-y-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-semibold">Jugadoras ({form.data.players.length})</h2><p className="text-sm">Podés guardar sin jugadoras. Para confirmar necesitás al menos ocho.</p></div><Button type="button" variant="secondary" onClick={() => form.setData('players', [...form.data.players, blankPlayer()])}>Agregar jugadora</Button></div>{form.data.players.map((p, index) => <fieldset key={p.id ?? `new-${index}`} className="grid gap-4 rounded border p-4 sm:grid-cols-3"><legend className="px-2">Jugadora {index + 1}</legend>{(['name_player', 'dni_player', 'birthdate_player'] as const).map((key, i) => <div key={key}><Label text={['Nombre completo *', 'DNI *', 'Nacimiento *'][i]} htmlFor={`player-${index}-${key}`} /><Input id={`player-${index}-${key}`} type={key === 'birthdate_player' ? 'date' : 'text'} value={p[key]} onChange={e => form.setData('players', form.data.players.map((item, n) => n === index ? { ...item, [key]: e.target.value } : item))} />{error(`players.${index}.${key}`)}</div>)}<div className="sm:col-span-3"><Button type="button" variant="danger" size="sm" onClick={() => form.setData('players', form.data.players.filter((_, n) => n !== index))}>Quitar jugadora</Button></div></fieldset>)}</section>
                <section className="space-y-4 rounded border p-5"><h2 className="text-lg font-semibold">Entrenador opcional</h2><label className="flex items-center gap-2"><input type="checkbox" checked={trainerEnabled} onChange={e => setTrainerEnabled(e.target.checked)} />Cargar entrenador</label>{trainerEnabled && <><Label text="Entrenador del torneo" htmlFor="trainer-select" /><Select id="trainer-select" value={form.data.id_trainer} onChange={e => form.setData('id_trainer', e.target.value)}><option value="">{initial?.trainer ? 'Editar entrenador actual' : 'Cargar nuevo entrenador'}</option>{trainers.map(t => <option key={t.id_trainer} value={t.id_trainer}>{t.name_trainer} · {t.dni_trainer}</option>)}</Select>{team?.trainer && !form.data.id_trainer && <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.data.new_trainer} onChange={e => { form.setData('new_trainer', e.target.checked); form.setData('trainer', e.target.checked ? blankTrainer() : { ...blankTrainer(), ...team.trainer, birthdate_trainer: team.trainer?.birthdate_trainer?.slice(0, 10) ?? '' }); }} />Reemplazar por un entrenador nuevo</label>}{!form.data.id_trainer && <div className="grid gap-4 sm:grid-cols-3">{(['name_trainer', 'dni_trainer', 'birthdate_trainer'] as const).map((key, i) => <div key={key}><Label text={['Nombre completo *', 'DNI *', 'Nacimiento *'][i]} htmlFor={key} /><Input id={key} type={key === 'birthdate_trainer' ? 'date' : 'text'} value={form.data.trainer[key] ?? ''} onChange={e => form.setData('trainer', { ...form.data.trainer, [key]: e.target.value })} />{error(`trainer.${key}`)}</div>)}</div>}</>}</section>
                <div className="flex flex-wrap gap-4">{local ? <><Button type="submit">Guardar equipo</Button><Button type="button" variant="secondary" onClick={local.cancel}>Cancelar</Button></> : <>{!confirmed && <Button type="submit" variant="secondary" disabled={form.processing}>Guardar borrador</Button>}<Button type="button" disabled={form.processing} onClick={() => submit('confirm')}>{confirmed ? 'Guardar cambios' : 'Confirmar inscripción'}</Button></>}</div>
            </form>
        </main>;
}
