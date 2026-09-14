import React from 'react';
import { router } from '@inertiajs/react';

export default function Create() {

    const[nameUser, setNameUser] = React.useState('');
    const[emailUser, setEmailUser] = React.useState('');
    const[passwordUser, setPasswordUser] = React.useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        router.post('/users', {
            name_user: nameUser,
            email: emailUser,   
            password: passwordUser
        });
    }

    return (
        <div>
            <h1>Crear Usuario</h1>
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
                        type="password"
                        value={passwordUser}
                        onChange={(e) => setPasswordUser(e.target.value)}
                    />
                </div>
                <button type="submit">Crear Usuario</button>
            </form>
        </div>
    );
}