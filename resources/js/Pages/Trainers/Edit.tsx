import React from "react";
import { router, Link, Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Button, Text, Input, Label, Icon } from "@/Components/Atoms";
import FormErrors from "@/Components/FormErrors";

interface Trainer {
    id_trainer: number;
    name_trainer: string;
    dni_trainer: string | null;
    birthdate_trainer: string | null;
}

export default function Edit({ trainer }: { trainer: Trainer }) {
    const [name, setName] = React.useState(trainer.name_trainer);
    const [dni, setDni] = React.useState(trainer.dni_trainer ?? "");
    const [birthdate, setBirthdate] = React.useState(trainer.birthdate_trainer ?? "");

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        router.put(`/trainers/${trainer.id_trainer}`, {
            name_trainer: name,
            dni_trainer: dni,
            birthdate_trainer: birthdate,
        });
    };

    return (
        <AuthenticatedLayout header={<Text variant="h2" color="primary">Editar Entrenador</Text>}>
            <Head title="Editar Entrenador" />
            <div className="py-12"><div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                <div className="overflow-hidden rounded-lg border-t-4 border-yellow-400 bg-white shadow-md"><div className="p-8">
                    <form onSubmit={handleSubmit} className="max-w-xl space-y-6">
                        <FormErrors />
                        <div><Label text="Nombre y apellido" htmlFor="name_trainer" /><div className="mt-1"><Input id="name_trainer" type="text" value={name} onChange={(event) => setName(event.target.value)} required /></div></div>
                        <div><Label text="DNI" htmlFor="dni_trainer" /><div className="mt-1"><Input id="dni_trainer" type="text" value={dni} onChange={(event) => setDni(event.target.value)} placeholder="DNI de 8 dígitos, con o sin puntos" required /></div></div>
                        <div><Label text="Fecha de nacimiento" htmlFor="birthdate_trainer" /><div className="mt-1"><Input id="birthdate_trainer" type="date" value={birthdate.slice(0, 10)} onChange={(event) => setBirthdate(event.target.value)} required /></div></div>
                        <div className="flex items-center gap-4 pt-4"><Button variant="primary" type="submit">Guardar cambios</Button><Link href="/trainers"><Button variant="secondary" size="sm"><Icon name="chevronLeft" size="sm" /> Volver</Button></Link></div>
                    </form>
                </div></div>
            </div></div>
        </AuthenticatedLayout>
    );
}
