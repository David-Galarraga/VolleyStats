import { Button, Checkbox, Input, Label, Text } from '@/Components/Atoms';
import InputError from '@/Components/InputError';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function Login({ status }: { status?: string }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name_user: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Ingresar" />

            <div className="mb-6">
                <Text variant="h3">Acceso institucional</Text>
                <Text variant="small" className="mt-1">
                    Ingresá con la cuenta asignada por el administrador.
                </Text>
            </div>

            {status && (
                <div className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-5">
                <div>
                    <Label text="Usuario" htmlFor="name_user" />

                    <Input
                        id="name_user"
                        name="name_user"
                        value={data.name_user}
                        className="mt-1"
                        autoComplete="username"
                        hasError={!!errors.name_user}
                        autoFocus
                        required
                        onChange={(e) => setData('name_user', e.target.value)}
                    />

                    <InputError message={errors.name_user} className="mt-2" />
                </div>

                <div>
                    <Label text="Contraseña" htmlFor="password" />

                    <Input
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1"
                        autoComplete="current-password"
                        hasError={!!errors.password}
                        required
                        onChange={(e) => setData('password', e.target.value)}
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <Checkbox
                    id="remember"
                    label="Recordarme"
                    status={data.remember ? 'marked' : 'unmarked'}
                    onChange={(status) =>
                        setData('remember', status === 'marked')
                    }
                />

                <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={processing}
                >
                    {processing ? 'Ingresando…' : 'Ingresar'}
                </Button>
            </form>
        </GuestLayout>
    );
}