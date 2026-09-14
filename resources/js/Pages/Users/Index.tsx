import React from 'react';
import { router } from '@inertiajs/react';
import { Link } from '@inertiajs/react';

interface User {
    id_user: number;
    name_user: string;
    email: string;
    is_active : boolean;
}

interface Props {
    users: User[];
} 

export default function Index({ users }: Props) {

    const handleDelete = (id_user: number) => {
        if (confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
            router.delete(`/users/${id_user}`);
        }
    };

    return (
        <div>
            <h1>Usuarios</h1>
            <br></br>

            <Link href="/users/create">
                Nuevo usuario
            </Link>

            {users.map((user) => (
                <div key={user.id_user}>
                    <h2>{user.name_user}</h2>
                    <p>Email: {user.email}</p>

                    <Link href={`/users/${user.id_user}/edit`}>
                        Editar usuario
                    </Link>
                    <br></br>

                    <button onClick={() => handleDelete(user.id_user)}>Eliminar</button>
                </div>
            ))}
        </div>
    );
}