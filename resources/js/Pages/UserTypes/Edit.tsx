import React from "react";
import { router } from "@inertiajs/react";

interface UserType {
    id_user_type: number;
    name_user_type: string;
    description_user_type: string;
}

interface Props {
    userType: UserType;
}

export default function Edit({ userType }: Props) {

    const [nameUserType, setNameUserType] = React.useState(userType.name_user_type);    
    const [descriptionUserType, setDescriptionUserType] = React.useState(userType.description_user_type);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        router.put(`/user-types/${userType.id_user_type}`, {
            name_user_type: nameUserType,
            description_user_type: descriptionUserType,
        });
    }

    return (
        <div>
            <h1>Editar Tipo de Usuario</h1>

            <form onSubmit={handleSubmit}>

                <div>
                    <label>Nombre tipo de usuario</label>

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

                <button type="submit">Actualizar</button>

            </form>
        </div>
    );
}