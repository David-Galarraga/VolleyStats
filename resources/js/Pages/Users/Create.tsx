import React from "react";
import { Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Text } from "@/Components/Atoms";
import UserForm from "./UserForm";

interface Props {
    roles: string[];
}

export default function Create({ roles }: Props) {
    return (
        <AuthenticatedLayout
            header={
                <Text variant="h2" color="primary">
                    Nuevo usuario
                </Text>
            }
        >
            <Head title="Nuevo usuario" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-md border-t-4 border-yellow-400 sm:rounded-lg">
                        <div className="p-8">
                            <UserForm roles={roles} title="Nuevo usuario" />
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
