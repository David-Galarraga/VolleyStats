import React from "react";
import { Link, Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Button, Text, Icon } from "@/Components/Atoms";

interface Tournament {
    id: number;
    name_tournament: string;
}

interface Team {
    id: number;
    name_team: string;
}

interface Referee {
    id: number;
    name_referee: string;
}

interface Game {
    id: number;
    date: string;
    time: string;
    status_game: string;
    set_local: number | null;
    set_visitor: number | null;
    result: string;
    tournament?: Tournament;
    teamLocal?: Team;
    teamVisitor?: Team;
    referee?: Referee;
}

interface Props {
    game: Game;
}

const formatDate = (iso: string) => {
    if (!iso) return "-";
    const [year, month, day] = iso.split("-");
    return `${day}/${month}/${year}`;
};

const DetailRow = ({ label, value }: { label: string; value: string }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
        <Text variant="p" color="secondary">
            {label}
        </Text>
        <Text variant="p" color="primary">
            {value}
        </Text>
    </div>
);

export default function Show({ game }: Props) {
    return (
        <AuthenticatedLayout
            header={
                <Text variant="h2" color="primary">
                    Detalle del Partido
                </Text>
            }
        >
            <Head title="Detalle del Partido" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-md border-t-4 border-yellow-400 sm:rounded-lg">
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-8">
                                <Link href="/games">
                                    <Button variant="secondary" size="sm">
                                        <Icon name="chevronLeft" size="sm" /> Volver
                                    </Button>
                                </Link>
                                <Link href={`/games/${game.id}/edit`}>
                                    <Button variant="primary" size="md">
                                        Editar
                                    </Button>
                                </Link>
                            </div>

                            <div className="max-w-xl mx-auto">
                                <div className="text-center mb-8">
                                    <Text variant="h3" color="primary">
                                        {game.teamLocal?.name_team || "-"} vs{" "}
                                        {game.teamVisitor?.name_team || "-"}
                                    </Text>
                                </div>

                                <div className="rounded-lg border border-gray-200 p-6">
                                    <DetailRow
                                        label="Torneo"
                                        value={game.tournament?.name_tournament || "-"}
                                    />
                                    <DetailRow
                                        label="Árbitro"
                                        value={game.referee?.name_referee || "-"}
                                    />
                                    <DetailRow
                                        label="Fecha"
                                        value={formatDate(game.date)}
                                    />
                                    <DetailRow
                                        label="Hora"
                                        value={game.time ? game.time.slice(0, 5) : "-"}
                                    />
                                    <DetailRow
                                        label="Estado"
                                        value={game.status_game}
                                    />
                                    <DetailRow
                                        label="Marcador"
                                        value={`${game.set_local ?? "-"} - ${game.set_visitor ?? "-"}`}
                                    />
                                    <DetailRow
                                        label="Resultado"
                                        value={game.result}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
