import React from "react";
import { router, Link, Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Button, Text, Input, Label, Icon } from "@/Components/Atoms";
import FormErrors from "@/Components/FormErrors";

interface Category { id_category: number; name_category: string; genero_category: string; }
interface Delegate { id_delegate: number; name_delegate: string; }
interface Trainer { id_trainer: number; name_trainer: string; }
interface PlayerDraft { name_player: string; dni_player: string; birthdate_player: string; }
interface Props { categories: Category[]; delegates: Delegate[]; trainers: Trainer[]; }

const blankPlayer = (): PlayerDraft => ({ name_player: "", dni_player: "", birthdate_player: "" });
const inputClass = "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400";

export default function Create({ categories, delegates, trainers }: Props) {
    const [nameTeam, setNameTeam] = React.useState("");
    const [cityTeam, setCityTeam] = React.useState("Gualeguaychú");
    const [idCategory, setIdCategory] = React.useState<number | "">("");
    const [idDelegate, setIdDelegate] = React.useState<number | "">("");
    const [idTrainer, setIdTrainer] = React.useState<number | "">("");
    const [players, setPlayers] = React.useState<PlayerDraft[]>(Array.from({ length: 6 }, blankPlayer));

    const updatePlayer = (index: number, field: keyof PlayerDraft, value: string) => {
        setPlayers((current) => current.map((player, i) => i === index ? { ...player, [field]: value } : player));
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        router.post("/teams", {
            name_team: nameTeam,
            city_team: cityTeam,
            id_category: idCategory,
            id_delegate: idDelegate,
            id_trainer: idTrainer || null,
            players: players.map(({ name_player, dni_player, birthdate_player }) => ({
                name_player,
                dni_player,
                birthdate_player,
            })),
        });
    };

    return (
        <AuthenticatedLayout header={<Text variant="h2" color="primary">Inscribir equipo</Text>}>
            <Head title="Inscribir equipo" />
            <div className="py-12"><div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                <div className="overflow-hidden rounded-lg border-t-4 border-yellow-400 bg-white shadow-md"><div className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <FormErrors />
                        <div className="grid gap-6 md:grid-cols-2">
                            <div><Label text="Nombre del equipo" htmlFor="name_team" /><div className="mt-1"><Input id="name_team" type="text" value={nameTeam} onChange={(event) => setNameTeam(event.target.value)} required /></div></div>
                            <div><Label text="Ciudad del equipo" htmlFor="city_team" /><div className="mt-1"><Input id="city_team" type="text" value={cityTeam} onChange={(event) => setCityTeam(event.target.value)} required /></div></div>
                            <div><Label text="Categoría" htmlFor="id_category" /><select id="id_category" className={inputClass} value={idCategory} onChange={(event) => setIdCategory(Number(event.target.value))} required><option value="">Seleccione una categoría</option>{categories.map((category) => <option key={category.id_category} value={category.id_category}>{category.name_category} ({category.genero_category})</option>)}</select></div>
                            <div><Label text="Delegado" htmlFor="id_delegate" /><select id="id_delegate" className={inputClass} value={idDelegate} onChange={(event) => setIdDelegate(Number(event.target.value))} required><option value="">Seleccione un delegado</option>{delegates.map((delegate) => <option key={delegate.id_delegate} value={delegate.id_delegate}>{delegate.name_delegate}</option>)}</select></div>
                            <div><Label text="Entrenador / DT (opcional)" htmlFor="id_trainer" /><select id="id_trainer" className={inputClass} value={idTrainer} onChange={(event) => setIdTrainer(event.target.value ? Number(event.target.value) : "")}><option value="">Sin entrenador asignado</option>{trainers.map((trainer) => <option key={trainer.id_trainer} value={trainer.id_trainer}>{trainer.name_trainer}</option>)}</select></div>
                        </div>

                        <section className="space-y-4">
                            <div className="flex flex-wrap items-center justify-between gap-3"><div><Text variant="h3" color="primary">Jugadoras y jugadores</Text><p className="text-sm text-slate-600">La inscripción requiere al menos seis integrantes.</p></div><Button type="button" variant="secondary" size="sm" onClick={() => setPlayers((current) => [...current, blankPlayer()])}>Agregar integrante</Button></div>
                            {players.map((player, index) => (
                                <fieldset key={index} className="grid gap-3 rounded-md border border-slate-200 p-4 md:grid-cols-3">
                                    <legend className="px-1 text-sm font-medium text-slate-700">Integrante {index + 1}</legend>
                                    <div><Label text="Nombre y apellido" htmlFor={`player-name-${index}`} /><Input id={`player-name-${index}`} type="text" value={player.name_player} onChange={(event) => updatePlayer(index, "name_player", event.target.value)} required /></div>
                                    <div><Label text="DNI" htmlFor={`player-dni-${index}`} /><Input id={`player-dni-${index}`} type="text" value={player.dni_player} onChange={(event) => updatePlayer(index, "dni_player", event.target.value)} placeholder="DNI de 8 dígitos, con o sin puntos" required /></div>
                                    <div><Label text="Fecha de nacimiento" htmlFor={`player-birthdate-${index}`} /><Input id={`player-birthdate-${index}`} type="date" value={player.birthdate_player} onChange={(event) => updatePlayer(index, "birthdate_player", event.target.value)} required /></div>
                                    {players.length > 6 && <div className="md:col-span-3"><Button type="button" variant="danger" size="sm" onClick={() => setPlayers((current) => current.filter((_, i) => i !== index))}>Quitar integrante</Button></div>}
                                </fieldset>
                            ))}
                        </section>

                        <div className="flex items-center gap-4"><Button variant="primary" type="submit">Inscribir equipo</Button><Link href="/teams"><Button variant="secondary" size="sm"><Icon name="chevronLeft" size="sm" /> Volver</Button></Link></div>
                    </form>
                </div></div>
            </div></div>
        </AuthenticatedLayout>
    );
}
