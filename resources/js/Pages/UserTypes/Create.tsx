import React from "react";
import { router } from "@inertiajs/react";

export default function Create() {

    const [nameUserType, setNameUserType] = React.useState('');
    const [descriptionUserType, setDescriptionUserType] = React.useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        router.post('/user-types', {
            name_user_type: nameUserType,
            description_user_type: descriptionUserType
        });
    }

    return (
        <div>
            <h1>Crear Tipo de Usuario</h1>

            <form onSubmit={handleSubmit}>

                <div>
                    <label>Nombre</label>  

                    <input
                        type="text"
                        value={nameUserType}
                        onChange={(e) => setNameUserType(e.target.value)}
                    />
                </div>

                <div>
                    <label>Descripción</label>

                    <textarea
                        value={descriptionUserType}
                        onChange={(e) => setDescriptionUserType(e.target.value)}
                    />
                </div>

                <button type="submit">Crear tipo de usuario</button>

            </form>
        </div>
    );
}