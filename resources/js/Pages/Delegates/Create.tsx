import React from "react";
import { router } from "@inertiajs/react";

export default function Create() {

    const [nameDelegate, setNameDelegate] = React.useState('');
    const [phoneDelegate, setPhoneDelegate] = React.useState('');
    const [emailDelegate, setEmailDelegate] = React.useState('');  

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        router.post('/delegates', {
            name_delegate: nameDelegate,
            email_delegate: emailDelegate,
            phone_delegate: phoneDelegate,
        });
    }
    return (
        <div>  
            <h1>Crear Delegado</h1>

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
                        type="text"
                        value={phoneDelegate}
                        onChange={(e) => setPhoneDelegate(e.target.value)}
                    />
                </div>

                <button type="submit">Crear Delegado</button>

            </form>
        </div>
    );
}
