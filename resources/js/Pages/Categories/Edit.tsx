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

interface Props {
    category: Category;
}

export default function Edit({ category }: Props) {
    const [nameCategory, setNameCategory] = React.useState(
        category.name_category
    );
    const [generoCategory, setGeneroCategory] = React.useState(
        category.genero_category
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        router.put(`/categories/${category.id_category}`, {
            name_category: nameCategory,
            genero_category: generoCategory,
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <Text variant="h2" color="primary">
                    Editar Categoría
                </Text>
            }
        >
            <Head title="Editar Categoría" />

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
                                        text="Nombre categoría"
                                        htmlFor="name_category"
                                    />
                                    <div className="mt-1">
                                        <Input
                                            id="name_category"
                                            type="text"
                                            value={nameCategory}
                                            onChange={(e) =>
                                                setNameCategory(e.target.value)
                                            }
                                            placeholder="Ingrese el nombre de la categoría"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label
                                        text="Género categoría"
                                        htmlFor="genero_category"
                                    />
                                    <div className="mt-1">
                                        <Input
                                            id="genero_category"
                                            type="text"
                                            value={generoCategory}
                                            onChange={(e) =>
                                                setGeneroCategory(
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Ingrese el género de la categoría"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 pt-4">
                                    <Button variant="primary" type="submit">
                                        Actualizar
                                    </Button>
                                    <Link href="/categories">
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