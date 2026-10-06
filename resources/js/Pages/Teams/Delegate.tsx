import React from "react";
import { Head, Link, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Button, Icon, Input, Label, Text } from "@/Components/Atoms";
import FormErrors from "@/Components/FormErrors";

interface Team {
    id: number;
    name_team: string;
}

interface DelegateData {
    id_delegate: number;
    name_delegate: string;
    email_delegate: string;
    phone_delegate: string;
}

interface AvailableDelegate {
    id_delegate: number;
    name_delegate: string;
    email_delegate: string;
}

interface Props {
    team: Team;
    delegate: DelegateData | null;
    availableDelegates: AvailableDelegate[];
}

export default function Delegate({ team, delegate, availableDelegates }: Props) {
    const [name, setName] = React.useState(delegate?.name_delegate ?? "");
    const [email, setEmail] = React.useState(delegate?.email_delegate ?? "");
    const [phone, setPhone] = React.useState(delegate?.phone_delegate ?? "");
    const [replacementId, setReplacementId] = React.useState<number | "">("");

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        const data = { name_delegate: name, email_delegate: email, phone_delegate: phone };
        if (delegate) {
            router.put(`/teams/${team.id}/delegate`, data);
        } else {
            router.post(`/teams/${team.id}/delegate`, data);
        }
    };

    const removeDelegate = (event: React.FormEvent) => {
        event.preventDefault();
        if (confirm("El equipo será reasignado al delegado seleccionado. El delegado actual se eliminará si ningún otro equipo lo utiliza. ¿Continuar?")) {
            router.delete(`/teams/${team.id}/delegate`, {
                data: { replacement_delegate_id: replacementId },
            });
        }
    };

    return (
        <AuthenticatedLayout header={<Text variant="h2" color="primary">Delegado · {team.name_team}</Text>}>
            <Head title={`Delegado — ${team.name_team}`} />
            <div className="py-12">
                <div className="mx-auto max-w-3xl sm:px-6 lg:px-8">
                    <section className="rounded-lg border-t-4 border-yellow-400 bg-white p-6 shadow-md sm:p-8">
                        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                            <Link href="/teams"><Button variant="secondary" size="sm"><Icon name="chevronLeft" size="sm" /> Volver a equipos</Button></Link>
                            <p className="text-sm text-slate-600">Equipo: <span className="font-medium text-slate-900">{team.name_team}</span></p>
                        </div>
                        <h3 className="mb-5 text-lg font-semibold text-slate-900">
                            {delegate ? "Datos del delegado" : "Registrar delegado"}
                        </h3>
                        <FormErrors />
                        <form onSubmit={submit} className="max-w-xl space-y-5">
                            <div><Label text="Nombre" htmlFor="name_delegate" /><Input id="name_delegate" value={name} onChange={(event) => setName(event.target.value)} required maxLength={50} /></div>
                            <div><Label text="Correo electrónico" htmlFor="email_delegate" /><Input id="email_delegate" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required maxLength={50} /></div>
                            <div><Label text="Teléfono" htmlFor="phone_delegate" /><Input id="phone_delegate" type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} required maxLength={15} /></div>
                            <div className="flex gap-3">
                                <Button type="submit">{delegate ? "Guardar cambios" : "Crear delegado"}</Button>
                            </div>
                        </form>
                        {delegate && (
                            <>
                                <p className="mt-5 text-sm text-slate-500">Al editar estos datos, se actualiza el registro global; otros equipos que compartan este delegado verán los cambios.</p>
                                <form onSubmit={removeDelegate} className="mt-8 border-t border-slate-200 pt-6">
                                    <h4 className="mb-2 font-semibold text-slate-900">Quitar este delegado del equipo</h4>
                                    {availableDelegates.length ? (
                                        <>
                                            <Label text="Reasignar el equipo a" htmlFor="replacement_delegate_id" />
                                            <select id="replacement_delegate_id" value={replacementId} onChange={(event) => setReplacementId(Number(event.target.value))} required className="mt-1 w-full max-w-xl rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm">
                                                <option value="">Seleccioná un delegado</option>
                                                {availableDelegates.map((option) => <option key={option.id_delegate} value={option.id_delegate}>{option.name_delegate} · {option.email_delegate}</option>)}
                                            </select>
                                            <div className="mt-4"><Button type="submit" variant="danger">Reasignar y quitar delegado actual</Button></div>
                                        </>
                                    ) : <p className="text-sm text-slate-600">Creá otro delegado antes de quitar el actual para mantener la asignación obligatoria del equipo.</p>}
                                </form>
                            </>
                        )}
                    </section>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
