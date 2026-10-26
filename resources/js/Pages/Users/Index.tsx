import React from "react";
import { Head, Link, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Button, Input, Select, Text } from "@/Components/Atoms";

interface UserRecord {
    id_user: number;
    name_user: string;
    email: string;
    is_active: boolean;
    role: string | null;
}

interface Props {
    users: UserRecord[];
}

export default function Index({ users }: Props) {
    const [search, setSearch] = React.useState("");
    const [roleFilter, setRoleFilter] = React.useState("");

    const roles = React.useMemo(() => {
        const unique = new Set<string>();
        users.forEach((user) => {
            if (user.role) unique.add(user.role);
        });
        return [...unique].sort((a, b) => a.localeCompare(b));
    }, [users]);

    const hasUsersWithoutRole = React.useMemo(
        () => users.some((user) => !user.role),
        [users]
    );

    const visibleUsers = React.useMemo(() => {
        const term = search.trim().toLowerCase();
        return users.filter((user) => {
            const matchesName =
                term === "" || user.name_user.toLowerCase().includes(term);
            const matchesRole =
                roleFilter === "" ||
                (roleFilter === "__none__"
                    ? !user.role
                    : user.role === roleFilter);
            return matchesName && matchesRole;
        });
    }, [users, search, roleFilter]);

    return (
        <AuthenticatedLayout
            header={
                <Text variant="h2" color="primary">
                    Usuarios
                </Text>
            }
        >
            <Head title="Usuarios" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-md border-t-4 border-yellow-400 sm:rounded-lg">
                        <div className="p-8">
                            <div className="mb-6 flex items-center justify-between">
                                <Text variant="h3" color="primary">
                                    Usuarios del sistema
                                </Text>
                                <Link href={route("users.create")}>
                                    <Button variant="primary">Nuevo usuario</Button>
                                </Link>
                            </div>

                            <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <Input
                                    type="search"
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    placeholder="Buscar por nombre…"
                                    aria-label="Buscar usuarios por nombre"
                                />
                                <Select
                                    value={roleFilter}
                                    onChange={(event) =>
                                        setRoleFilter(event.target.value)
                                    }
                                    aria-label="Filtrar usuarios por rol"
                                >
                                    <option value="">Todos los roles</option>
                                    {roles.map((role) => (
                                        <option key={role} value={role}>
                                            {role}
                                        </option>
                                    ))}
                                    {hasUsersWithoutRole && (
                                        <option value="__none__">
                                            Sin rol
                                        </option>
                                    )}
                                </Select>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Nombre
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Email
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Rol
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Estado
                                            </th>
                                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Acciones
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {visibleUsers.map((user) => (
                                            <tr key={user.id_user} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-700">
                                                    {user.name_user}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                                                    {user.email}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                                                    {user.role || "Sin rol"}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                                                    {user.is_active ? "Activo" : "Inactivo"}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Link href={route("users.edit", user.id_user)}>
                                                            <Button variant="secondary" size="sm">
                                                                Editar
                                                            </Button>
                                                        </Link>
                                                        <Button
                                                            variant="danger"
                                                            size="sm"
                                                            onClick={() => {
                                                                if (
                                                                    confirm(
                                                                        "¿Eliminar este usuario?"
                                                                    )
                                                                ) {
                                                                    router.delete(
                                                                        route(
                                                                            "users.destroy",
                                                                            user.id_user
                                                                        )
                                                                    );
                                                                }
                                                            }}
                                                        >
                                                            Eliminar
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {visibleUsers.length === 0 && (
                                <p className="py-6 text-center text-sm text-gray-500">
                                    {users.length === 0
                                        ? "No hay usuarios registrados."
                                        : "Sin resultados para los filtros aplicados."}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
