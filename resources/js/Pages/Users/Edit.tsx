import React from 'react';
import { router } from '@inertiajs/react';

interface User {
    id_user: number;
    name_user: string;
    email: string;
    password: string;
}

interface Props {
    user: User;
}

export default function Edit({ user }: Props) {

    const [nameUser, setNameUser] = React.useState(user.name_user);
    const [emailUser, setEmailUser] = React.useState(user.email);
    const [passwordUser, setPasswordUser] = React.useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        router.put(`/users/${user.id_user}`, {
            name_user: nameUser,
            email: emailUser,
            password: passwordUser
        });
    }

    return (
        <div>
            <h1>Editar Usuario</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Nombre</label>
                    <input
                        type="text"
                        value={nameUser}
                        onChange={(e) => setNameUser(e.target.value)}
                    />
                </div>

                <div>
                    <label>Email</label>
                    <input
                        type="email"
                        value={emailUser}
                        onChange={(e) => setEmailUser(e.target.value)}
                    />
                </div>

                <div>
                    <label>Contraseña</label>
                    <input
                        type='password'
                        value={passwordUser}
                        onChange={(e) => setPasswordUser(e.target.value)}
                    />
                </div>

                <button type='submit'>Actualizar</button>
            </form>
        </div>
    );
}
