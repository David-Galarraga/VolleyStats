import React from "react";
import { Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Text } from "@/Components/Atoms";
import UserForm from "./UserForm";

interface UserRecord {
    id_user: number;
    name_user: string;
    email: string;
    is_active: boolean;
}

interface Props {
    user: UserRecord;
    currentRole: string | null;
    roles: string[];
}

export default function Edit({ user, currentRole, roles }: Props) {
    return (
        <AuthenticatedLayout
            header={
                <Text variant="h2" color="primary">
                    Editar usuario
                </Text>
            }
        >
            <Head title="Editar usuario" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-md border-t-4 border-yellow-400 sm:rounded-lg">
                        <div className="p-8">
                            <UserForm
                                user={user}
                                currentRole={currentRole}
                                roles={roles}
                                title="Editar usuario"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
