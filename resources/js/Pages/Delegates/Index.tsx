import React from "react";
import { router } from "@inertiajs/react";
import { Link } from "@inertiajs/react";

interface Delegate {
    id_delegate: number;
    name_delegate: string;
    surname_delegate: string;
    email_delegate: string;
}

interface Props {
    delegates: Delegate[];
}

export default function Index({delegates}: Props) {

    const handleDelete = (id_delegate: number) => {
        if (confirm("¿Estás seguro de que deseas eliminar este delegado?")) {
            router.delete(`/delegates/${id_delegate}`);
        }
    };  

return (
    <div>
        <h1>Delegates</h1>
        <br></br>

        <Link href="/delegates/create">
            Nuevo delegado
        </Link>

        {delegates.map((delegate) => (
            <div key={delegate.id_delegate}>
                <h2>{delegate.name_delegate} {delegate.surname_delegate}</h2>
                <p>Email: {delegate.email_delegate}</p>

                <Link href={`/delegates/${delegate.id_delegate}/edit`}>
                    Editar
                </Link>

                <button onClick={() => handleDelete(delegate.id_delegate)}>
                    Eliminar
                </button>
            </div>
        ))}
    </div>
    );
}
