import React from "react";
import { Link, useForm } from "@inertiajs/react";
import { Button, Icon, Input, Label } from "@/Components/Atoms";
import InputError from "@/Components/InputError";
import FormErrors from "@/Components/FormErrors";

interface UserRecord {
    id_user: number;
    name_user: string;
    email: string;
    is_active: boolean;
}

interface Props {
    user?: UserRecord;
    currentRole?: string | null;
    roles: string[];
    title: string;
}

export default function UserForm({ user, currentRole, roles, title }: Props) {
    const { data, setData, post, put, processing, errors } = useForm({
        name_user: user?.name_user ?? "",
        email: user?.email ?? "",
        password: "",
        password_confirmation: "",
        role: currentRole ?? "",
        is_active: user?.is_active ?? true,
    });

    const submit = (event: React.FormEvent) => {
        event.preventDefault();

        if (user) {
            put(route("users.update", user.id_user));
            return;
        }

        post(route("users.store"));
    };

    return (
        <form onSubmit={submit} className="max-w-xl space-y-6">
            <FormErrors />

            <div>
                <Label text="Nombre" htmlFor="name_user" />
                <div className="mt-1">
                    <Input
                        id="name_user"
                        value={data.name_user}
                        hasError={!!errors.name_user}
                        onChange={(event) => setData("name_user", event.target.value)}
                        required
                    />
                </div>
                <InputError message={errors.name_user} className="mt-2" />
            </div>

            <div>
                <Label text="Email" htmlFor="email" />
                <div className="mt-1">
                    <Input
                        id="email"
                        type="email"
                        value={data.email}
                        hasError={!!errors.email}
                        onChange={(event) => setData("email", event.target.value)}
                        required
                    />
                </div>
                <InputError message={errors.email} className="mt-2" />
            </div>

            <div>
                <Label text="Rol" htmlFor="role" />
                <div className="mt-1">
                    <select
                        id="role"
                        value={data.role}
                        onChange={(event) => setData("role", event.target.value)}
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400"
                        required
                    >
                        <option value="">Seleccione un rol</option>
                        {roles.map((role) => (
                            <option key={role} value={role}>
                                {role}
                            </option>
                        ))}
                    </select>
                </div>
                <InputError message={errors.role} className="mt-2" />
            </div>

            <div>
                <Label
                    text={user ? "Nueva contraseña (opcional)" : "Contraseña"}
                    htmlFor="password"
                />
                <div className="mt-1">
                    <Input
                        id="password"
                        type="password"
                        value={data.password}
                        hasError={!!errors.password}
                        onChange={(event) => setData("password", event.target.value)}
                        required={!user}
                    />
                </div>
                <InputError message={errors.password} className="mt-2" />
            </div>

            <div>
                <Label text="Confirmar contraseña" htmlFor="password_confirmation" />
                <div className="mt-1">
                    <Input
                        id="password_confirmation"
                        type="password"
                        value={data.password_confirmation}
                        onChange={(event) =>
                            setData("password_confirmation", event.target.value)
                        }
                        required={!user && !!data.password}
                    />
                </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                    type="checkbox"
                    checked={data.is_active}
                    onChange={(event) => setData("is_active", event.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-yellow-500 focus:ring-yellow-400"
                />
                Usuario activo
            </label>
            <InputError message={errors.is_active} className="mt-2" />

            <div className="flex items-center gap-4 pt-4">
                <Button variant="primary" type="submit" disabled={processing}>
                    {user ? "Guardar cambios" : "Crear usuario"}
                </Button>
                <Link href={route("users.index")}>
                    <Button variant="secondary" size="sm">
                        <Icon name="chevronLeft" size="sm" /> Volver
                    </Button>
                </Link>
            </div>
        </form>
    );
}
