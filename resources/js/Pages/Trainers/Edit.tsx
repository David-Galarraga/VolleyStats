import React from "react";
import { router } from "@inertiajs/react";
import { Link, Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Button, Text, Input, Label, Icon } from "@/Components/Atoms";

interface Trainer {
    id_trainer: number;
    name_trainer: string;
    phone_trainer: string;
    email_trainer: string;
}

interface Props {
    trainer: Trainer;
}

export default function Edit({ trainer }: Props) {
    const [nameTrainer, setNameTrainer] = React.useState(trainer.name_trainer || "");
    const [phoneTrainer, setPhoneTrainer] = React.useState(trainer.phone_trainer || "");
    const [emailTrainer, setEmailTrainer] = React.useState(trainer.email_trainer || "");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        router.put(`/trainers/${trainer.id_trainer}`, {
            name_trainer: nameTrainer,
            phone_trainer: phoneTrainer,
            email_trainer: emailTrainer,
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <Text variant="h2" color="primary">
                    Editar Entrenador
                </Text>
            }
        >
            <Head title="Editar Entrenador" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-md border-t-4 border-yellow-400 sm:rounded-lg">
                        <div className="p-8">
                            <form
                                onSubmit={handleSubmit}
                                className="space-y-6 max-w-xl"
                            >
                                <div>
                                    <Label
                                        text="Nombre del entrenador"
                                        htmlFor="name_trainer"
                                    />
                                    <div className="mt-1">
                                        <Input
                                            id="name_trainer"
                                            type="text"
                                            value={nameTrainer}
                                            onChange={(e) =>
                                                setNameTrainer(e.target.value)
                                            }
                                            placeholder="Ingrese el nombre del entrenador"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label
                                        text="Teléfono del entrenador"
                                        htmlFor="phone_trainer"
                                    />
                                    <div className="mt-1">
                                        <Input
                                            id="phone_trainer"
                                            type="tel"
                                            value={phoneTrainer}
                                            onChange={(e) =>
                                                setPhoneTrainer(e.target.value)
                                            }
                                            placeholder="Ingrese el teléfono del entrenador"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label
                                        text="Email del entrenador"
                                        htmlFor="email_trainer"
                                    />
                                    <div className="mt-1">
                                        <Input
                                            id="email_trainer"
                                            type="email"
                                            value={emailTrainer}
                                            onChange={(e) =>
                                                setEmailTrainer(e.target.value)
                                            }
                                            placeholder="Ingrese el email del entrenador"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 pt-4">
                                    <Button variant="primary" type="submit">
                                        Guardar cambios
                                    </Button>
                                    <Link href="/trainers">
                                        <Button variant="secondary" size="sm">
                                            <Icon
                                                name="chevronLeft"
                                                size="sm"
                                            />{" "}
                                            Volver
                                        </Button>
                                    </Link>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
