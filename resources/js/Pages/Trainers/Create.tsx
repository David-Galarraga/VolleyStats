import React from "react";
import { router, Link, Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Button, Text, Input, Label, Icon } from "@/Components/Atoms";
import FormErrors from "@/Components/FormErrors";

export default function Create() {
    const [name, setName] = React.useState("");
    const [dni, setDni] = React.useState("");
    const [birthdate, setBirthdate] = React.useState("");

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        router.post("/trainers", {
            name_trainer: name,
            dni_trainer: dni,
            birthdate_trainer: birthdate,
        });
    };

    return (
        <AuthenticatedLayout header={<Text variant="h2" color="primary">Crear Entrenador</Text>}>
            <Head title="Crear Entrenador" />
            <div className="py-12"><div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                <div className="overflow-hidden rounded-lg border-t-4 border-yellow-400 bg-white shadow-md"><div className="p-8">
                    <form onSubmit={handleSubmit} className="max-w-xl space-y-6">
                        <FormErrors />
                        <div><Label text="Nombre y apellido" htmlFor="name_trainer" /><div className="mt-1"><Input id="name_trainer" type="text" value={name} onChange={(event) => setName(event.target.value)} required /></div></div>
                        <div><Label text="DNI" htmlFor="dni_trainer" /><div className="mt-1"><Input id="dni_trainer" type="text" value={dni} onChange={(event) => setDni(event.target.value)} placeholder="DNI de 8 dígitos, con o sin puntos" required /></div></div>
                        <div><Label text="Fecha de nacimiento" htmlFor="birthdate_trainer" /><div className="mt-1"><Input id="birthdate_trainer" type="date" value={birthdate} onChange={(event) => setBirthdate(event.target.value)} required /></div></div>
                        <div className="flex items-center gap-4 pt-4"><Button variant="primary" type="submit">Crear entrenador</Button><Link href="/trainers"><Button variant="secondary" size="sm"><Icon name="chevronLeft" size="sm" /> Volver</Button></Link></div>
                    </form>
                </div></div>
            </div></div>
        </AuthenticatedLayout>
    );
}
