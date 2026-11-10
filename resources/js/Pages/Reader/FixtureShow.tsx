import React from "react";
import { Link, Head } from "@inertiajs/react";
import PublicLayout from "@/Layouts/PublicLayout";
import { Button, Text, Icon } from "@/Components/Atoms";

interface Tournament { id: number; name_tournament: string; }
interface Team { id: number; name_team: string; }
interface Game {
    id: number;
    date: string;
    time: string;
    team_local?: Team;
    team_visitor?: Team;
    result?: string;
}
interface Fixture {
    id: number;
    id_tournament: number;
    name_fixture: string;
    start_date: string;
    end_date: string;
    status_fixture: string;
    tournament?: Tournament;
    games: Game[];
}

interface Props { fixture: Fixture; }

const statusLabels: Record<string, string> = {
    scheduled: "Programado",
    in_progress: "En curso",
    finished: "Finalizado",
    canceled: "Cancelado",
};

const formatDate = (iso: string) => {
    if (!iso) return "-";
    const normalized = iso.slice(0, 10);
    const [year, month, day] = normalized.split("-");
    if (!year || !month || !day) return "-";
    return `${day}/${month}/${year}`;
};

const sortByTime = (games: Game[]) => [...games].sort((a, b) => (a.time || "").localeCompare(b.time || ""));

export default function FixtureShow({ fixture }: Props) {
    const saturdayGames = sortByTime(fixture.games.filter((g) => g.date?.slice(0,10) === fixture.start_date?.slice(0,10)));
    const sundayGames = sortByTime(fixture.games.filter((g) => g.date?.slice(0,10) === fixture.end_date?.slice(0,10)));

    const GamesTable = ({ games }: { games: Game[] }) => (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Local</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Visitante</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Hora</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Resultado</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {games.map((game) => (
                        <tr key={game.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">{game.team_local?.name_team || "-"}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{game.team_visitor?.name_team || "-"}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{game.time ? game.time.slice(0,5) : "-"}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{game.result || "-"}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    return (
        <PublicLayout>
            <Head title={fixture.name_fixture} />
            <div className="py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-md border-t-4 border-yellow-400 sm:rounded-lg">
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-8">
                                <Link href="/lector">
                                    <Button variant="secondary" size="sm">
                                        <Icon name="chevronLeft" size="sm" /> Volver
                                    </Button>
                                </Link>
                            </div>
                            <dl className="grid grid-cols-2 gap-6 mb-8 max-w-xl">
                                <div>
                                    <dt className="text-xs font-semibold text-gray-500 uppercase">Torneo</dt>
                                    <dd className="text-sm text-gray-700">{fixture.tournament?.name_tournament || "-"}</dd>
                                </div>
                                <div>
                                    <dt className="text-xs font-semibold text-gray-500 uppercase">Estado</dt>
                                    <dd className="text-sm text-gray-700">{statusLabels[fixture.status_fixture] || fixture.status_fixture || "-"}</dd>
                                </div>
                                <div>
                                    <dt className="text-xs font-semibold text-gray-500 uppercase">Sábado</dt>
                                    <dd className="text-sm text-gray-700">{formatDate(fixture.start_date)}</dd>
                                </div>
                                <div>
                                    <dt className="text-xs font-semibold text-gray-500 uppercase">Domingo</dt>
                                    <dd className="text-sm text-gray-700">{formatDate(fixture.end_date)}</dd>
                                </div>
                            </dl>

                            <section className="mb-8">
                                <Text variant="h3" color="primary">Sábado {formatDate(fixture.start_date)}</Text>
                                <div className="mt-4">
                                    {saturdayGames.length > 0 ? <GamesTable games={saturdayGames} /> : <Text variant="p" color="secondary">Sin partidos el sábado.</Text>}
                                </div>
                            </section>
                            <section>
                                <Text variant="h3" color="primary">Domingo {formatDate(fixture.end_date)}</Text>
                                <div className="mt-4">
                                    {sundayGames.length > 0 ? <GamesTable games={sundayGames} /> : <Text variant="p" color="secondary">Sin partidos el domingo.</Text>}
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
