import React from "react";
import { router } from "@inertiajs/react";

interface Delegate {
    id_delegate: number;
    name_delegate: string;
    email_delegate: string;
    phone_delegate: string;
}

interface Props {
    delegate: Delegate;
}  

export default function Edit({ delegate }: Props) {

    const [nameDelegate, setNameDelegate] = React.useState(delegate.name_delegate);
    const [emailDelegate, setEmailDelegate] = React.useState(delegate.email_delegate);
    const [phoneDelegate, setPhoneDelegate] = React.useState(delegate.phone_delegate);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault(); 

        router.put(`/delegates/${delegate.id_delegate}`, {
            name_delegate: nameDelegate,
            email_delegate: emailDelegate,
            phone_delegate: phoneDelegate,
        });
    }

    return (
        <div>
            <h1>Editar Delegado</h1>

            <form onSubmit={handleSubmit}>
                <div>
                    <label>Nombre delegado</label>
                    <input
                        type="text"
                        value={nameDelegate}
                        onChange={(e) => setNameDelegate(e.target.value)}
                    />
                </div>

                <div>
                    <label>Email delegado</label>
                    <input
                        type="email"
                        value={emailDelegate}
                        onChange={(e) => setEmailDelegate(e.target.value)}
                    />
                </div>

                <div>
                    <label>Teléfono delegado</label>
                    <input
                        type="tel"
                        value={phoneDelegate}
                        onChange={(e) => setPhoneDelegate(e.target.value)}
                    />
                </div>

                <button type="submit">Actualizar</button>
            </form>
        </div>
    );
}