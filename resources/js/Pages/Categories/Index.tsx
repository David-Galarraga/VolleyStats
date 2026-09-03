import React, { useState } from "react";
import { router } from "@inertiajs/react";
import { Link } from "@inertiajs/react";

interface Category {
    id_category: number;
    name_category: string;
    genero_category: string;
}

interface Props {
    categories: Category[];
}

export default function Index({categories}: Props) {

    const handleDelete = (id_category: number) => {
        if (confirm("¿Estás seguro de que deseas eliminar esta categoría?")) {
            router.delete(`/categories/${id_category}`);
        }
    };

    return (
        <div>
            <h1>Categories</h1>
            <br></br>

            <Link href="/categories/create">
                Nueva categoria
            </Link>
               
            {categories.map((category) => (
                <div key={category.id_category}>
                    <h2>{category.name_category}</h2>
                    <p>{category.genero_category}</p>

                    <Link href={`/categories/${category.id_category}/edit`}>
                        Editar categoria
                    </Link>
                    <br></br>

                    <button onClick={() => handleDelete(category.id_category)}>Eliminar</button>
                </div>
            ))}
        </div>

    );
}