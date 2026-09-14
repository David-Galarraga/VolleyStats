import React from "react";
import { router } from "@inertiajs/react";
import { Link, Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Button, Text, Input, Label, Icon } from "@/Components/Atoms";

interface Category {
    id_category: number;
    name_category: string;
    genero_category: string;
}

interface Trainer {
    id_trainer: number;
    name_trainer: string;
    phone_trainer: string;
    email_trainer: string;
}

interface Delegate {
    id_delegate: number;
    name_delegate: string;
    email_delegate: string;
    phone_delegate: string;
}

interface Props {
    categories: Category[];
    trainers: Trainer[];
    delegates: Delegate[];
}

export default function Create({ categories, trainers, delegates }: Props) {
    const [nameTeam, setNameTeam] = React.useState("");
    const [cityTeam, setCityTeam] = React.useState("");
    const [idCategory, setIdCategory] = React.useState<number | "">("");
    const [idTrainer, setIdTrainer] = React.useState<number | "">("");
    const [idDelegate, setIdDelegate] = React.useState<number | "">("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        router.post("/teams", {
            name_team: nameTeam,
            city_team: cityTeam,
            id_category: idCategory,
            id_trainer: idTrainer,
            id_delegate: idDelegate,
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <Text variant="h2" color="primary">
                    Crear Equipo
                </Text>
            }
        >
            <Head title="Crear Equipo" />

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
                                        text="Nombre del equipo"
                                        htmlFor="name_team"
                                    />
                                    <div className="mt-1">
                                        <Input
                                            id="name_team"
                                            type="text"
                                            value={nameTeam}
                                            onChange={(e) =>
                                                setNameTeam(e.target.value)
                                            }
                                            placeholder="Ingrese el nombre del equipo"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label
                                        text="Ciudad del equipo"
                                        htmlFor="city_team"
                                    />
                                    <div className="mt-1">
                                        <Input
                                            id="city_team"
                                            type="text"
                                            value={cityTeam}
                                            onChange={(e) =>
                                                setCityTeam(e.target.value)
                                            }
                                            placeholder="Ingrese la ciudad del equipo"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label
                                        text="Categoría"
                                        htmlFor="id_category"
                                    />
                                    <div className="mt-1">
                                        <select
                                            id="id_category"
                                            value={idCategory}
                                            onChange={(e) =>
                                                setIdCategory(Number(e.target.value))
                                            }
                                            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400"
                                            required
                                        >
                                            <option value="">
                                                Seleccione una categoría
                                            </option>
                                            {categories.map((cat) => (
                                                <option
                                                    key={cat.id_category}
                                                    value={cat.id_category}
                                                >
                                                    {cat.name_category} ({cat.genero_category})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <Label
                                        text="Entrenador"
                                        htmlFor="id_trainer"
                                    />
                                    <div className="mt-1">
                                        <select
                                            id="id_trainer"
                                            value={idTrainer}
                                            onChange={(e) =>
                                                setIdTrainer(Number(e.target.value))
                                            }
                                            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400"
                                            required
                                        >
                                            <option value="">
                                                Seleccione un entrenador
                                            </option>
                                            {trainers.map((tr) => (
                                                <option
                                                    key={tr.id_trainer}
                                                    value={tr.id_trainer}
                                                >
                                                    {tr.name_trainer}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <Label
                                        text="Delegado"
                                        htmlFor="id_delegate"
                                    />
                                    <div className="mt-1">
                                        <select
                                            id="id_delegate"
                                            value={idDelegate}
                                            onChange={(e) =>
                                                setIdDelegate(Number(e.target.value))
                                            }
                                            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400"
                                            required
                                        >
                                            <option value="">
                                                Seleccione un delegado
                                            </option>
                                            {delegates.map((del) => (
                                                <option
                                                    key={del.id_delegate}
                                                    value={del.id_delegate}
                                                >
                                                    {del.name_delegate}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 pt-4">
                                    <Button variant="primary" type="submit">
                                        Crear equipo
                                    </Button>
                                    <Link href="/teams">
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
