import React from "react";
import { router } from "@inertiajs/react";

export default function Create() {

    const [nameCategory, setNameCategory] = React.useState('');
    const [generoCategory, setGeneroCategory] = React.useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        router.post('/categories', {
            name_category: nameCategory,
            genero_category: generoCategory,
        });
    }
    return (
        <div>  
            <h1>Crear Categoría</h1>

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
                <button type="submit">Crear categoria</button>
            </form>
        </div>
    );
}