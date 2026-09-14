import React from "react";
import {router} from "@inertiajs/react";
import {Link} from "@inertiajs/react";


interface UserType {
    id_user_type: number;
    name_user_type: string;
}

interface Props {
    userTypes: UserType[];
}

export default function Index({userTypes}: Props) {

    const handleDelete = (id_user_type: number) => {
        if (confirm("¿Estás seguro de que deseas eliminar este tipo de usuario?")) {
            router.delete(`/user-types/${id_user_type}`);
        }
    };

    return (
        <div>
            <h1>Tipos de usuario</h1>
            <br></br>

            <Link href="/user-types/create">
                Nuevo tipo de usuario
            </Link>

            {userTypes.map((userType) => (
                <div key={userType.id_user_type}>
                    <h2>{userType.name_user_type}</h2>

                    <Link href={`/user-types/${userType.id_user_type}/edit`}>
                        Editar tipo de usuario
                    </Link>
                    <br></br>

                    <button onClick={() => handleDelete(userType.id_user_type)}>Eliminar</button>
                </div>
            ))}
        </div>
    );
}