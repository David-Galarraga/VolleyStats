import React from "react";
import { router } from "@inertiajs/react";

interface Category {
    id_category: number;
    name_category: string;
    genero_category: string;
}

interface Props {
    category: Category;
}

export default function Edit({ category }: Props) {

    const [nameCategory, setNameCategory] = React.useState(category.name_category);
    const [generoCategory, setGeneroCategory] = React.useState(category.genero_category);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        router.put(`/categories/${category.id_category}`, {
            name_category: nameCategory,
            genero_category: generoCategory,
        });
    };

    return (
        <div>
            <h1>Editar Categoría</h1>

            <form onSubmit={handleSubmit}>
                <div>
                    <label>Nombre categoria</label>
                    <input
                        type="text"
                        value={nameCategory}
                        onChange={(e) => setNameCategory(e.target.value)}
                    />
                </div>
                <div>
                    <label>Género categoria</label>
                    <input
                        type="text"
                        value={generoCategory}
                        onChange={(e) => setGeneroCategory(e.target.value)}
                    />
                </div>
                <button type="submit">Actualizar</button>
            </form>
        </div>
    );
}