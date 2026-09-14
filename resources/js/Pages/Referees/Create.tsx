import React from "react";
import { router } from "@inertiajs/react";
import { Link, Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Button, Text, Input, Label, Icon } from "@/Components/Atoms";

export default function Create() {
    const [nameReferee, setNameReferee] = React.useState("");
    const [phoneReferee, setPhoneReferee] = React.useState("");
    const [emailReferee, setEmailReferee] = React.useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        router.post("/referees", {
            name_referee: nameReferee,
            phone_referee: phoneReferee,
            email_referee: emailReferee,
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <Text variant="h2" color="primary">
                    Crear Árbitro
                </Text>
            }
        >
            <Head title="Crear Árbitro" />

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
                                        text="Nombre del árbitro"
                                        htmlFor="name_referee"
                                    />
                                    <div className="mt-1">
                                        <Input
                                            id="name_referee"
                                            type="text"
                                            value={nameReferee}
                                            onChange={(e) =>
                                                setNameReferee(e.target.value)
                                            }
                                            placeholder="Ingrese el nombre del árbitro"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label
                                        text="Teléfono del árbitro"
                                        htmlFor="phone_referee"
                                    />
                                    <div className="mt-1">
                                        <Input
                                            id="phone_referee"
                                            type="tel"
                                            value={phoneReferee}
                                            onChange={(e) =>
                                                setPhoneReferee(e.target.value)
                                            }
                                            placeholder="Ingrese el teléfono del árbitro"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label
                                        text="Email del árbitro"
                                        htmlFor="email_referee"
                                    />
                                    <div className="mt-1">
                                        <Input
                                            id="email_referee"
                                            type="email"
                                            value={emailReferee}
                                            onChange={(e) =>
                                                setEmailReferee(e.target.value)
                                            }
                                            placeholder="Ingrese el email del árbitro"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 pt-4">
                                    <Button variant="primary" type="submit">
                                        Crear Árbitro
                                    </Button>
                                    <Link href="/referees">
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
