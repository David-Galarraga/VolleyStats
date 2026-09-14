import { usePage } from "@inertiajs/react";
import { ErrorMessage } from "@/Components/Atoms";

export default function FormErrors() {
    const { errors } = usePage().props;
    const messages = Object.values(errors ?? {});

    if (messages.length === 0) return null;

    return (
        <div className="space-y-2">
            {messages.map((message, index) => (
                <ErrorMessage key={index} message={message} />
            ))}
        </div>
    );
}
