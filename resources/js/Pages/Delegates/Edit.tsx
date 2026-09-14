import React from "react";
import { router } from "@inertiajs/react";
import { Link, Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Button, Text, Input, Label, Icon } from "@/Components/Atoms";

interface Delegate {
    id_delegate: number;
    name_delegate: string;
    email_delegate: string;
    phone_delegate: string;
}

interface Props {
    delegate: Delegate;
}

export default function Edit({ delegate }: Props) {
    const [nameDelegate, setNameDelegate] = React.useState(
        delegate.name_delegate
    );
    const [emailDelegate, setEmailDelegate] = React.useState(
        delegate.email_delegate
    );
    const [phoneDelegate, setPhoneDelegate] = React.useState(
        delegate.phone_delegate
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        router.put(`/delegates/${delegate.id_delegate}`, {
            name_delegate: nameDelegate,
            email_delegate: emailDelegate,
            phone_delegate: phoneDelegate,
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <Text variant="h2" color="primary">
                    Editar Delegado
                </Text>
            }
        >
            <Head title="Editar Delegado" />

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
                                        text="Nombre delegado"
                                        htmlFor="name_delegate"
                                    />
                                    <div className="mt-1">
                                        <Input
                                            id="name_delegate"
                                            type="text"
                                            value={nameDelegate}
                                            onChange={(e) =>
                                                setNameDelegate(e.target.value)
                                            }
                                            placeholder="Ingrese el nombre del delegado"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label
                                        text="Email delegado"
                                        htmlFor="email_delegate"
                                    />
                                    <div className="mt-1">
                                        <Input
                                            id="email_delegate"
                                            type="email"
                                            value={emailDelegate}
                                            onChange={(e) =>
                                                setEmailDelegate(e.target.value)
                                            }
                                            placeholder="Ingrese el email del delegado"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label
                                        text="Teléfono delegado"
                                        htmlFor="phone_delegate"
                                    />
                                    <div className="mt-1">
                                        <Input
                                            id="phone_delegate"
                                            type="tel"
                                            value={phoneDelegate}
                                            onChange={(e) =>
                                                setPhoneDelegate(e.target.value)
                                            }
                                            placeholder="Ingrese el teléfono del delegado"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 pt-4">
                                    <Button variant="primary" type="submit">
                                        Actualizar
                                    </Button>
                                    <Link href="/delegates">
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