import React from "react";
import { Head, Link } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Button, Text } from "@/Components/Atoms";

interface Team {
    id: number;
    name_team: string;
}

interface Tournament {
    id: number;
    name_tournament: string;
}

interface Fixture {
    id: number;
    name_fixture: string;
}

interface Category {
    id_category: number;
    name_category: string;
    genero_category: string;
}

interface Sheet {
    id: number;
    status_sheet: string;
    closed_at: string | null;
}

interface MatchResult {
    sets_local: number;
    sets_visitor: number;
}

interface Game {
    id: number;
    date: string | null;
    time: string;
    day: string | null;
    status_game: string;
    phase_label: string;
    tournament: Tournament | null;
    fixture: Fixture | null;
    category: Category | null;
    team_local: Team | null;
    team_visitor: Team | null;
    sheet: Sheet | null;
    match_result: MatchResult | null;
}

interface Props {
    games: Game[];
}

const formatDate = (iso?: string | null) => {
    if (!iso) return "-";
    const [year, month, day] = iso.slice(0, 10).split("-");
    return `${day}/${month}/${year}`;
};

const sheetStatus = (game: Game) => {
    if (!game.sheet) return "Sin iniciar";
    return game.sheet.status_sheet === "closed" ? "Cerrada" : "Borrador";
};

export default function Mine({ games }: Props) {
    return (
        <AuthenticatedLayout
            header={
                <Text variant="h2" color="primary">
                    Mis planillas
                </Text>
            }
        >
            <Head title="Mis planillas" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-md border-t-4 border-yellow-400 sm:rounded-lg">
                        <div className="p-8">
                            <Text variant="h3" color="primary">
                                Partidos asignados
                            </Text>

                            {games.length === 0 ? (
                                <p className="mt-6 text-sm text-gray-500">
                                    Todavía no tenés planillas asignadas.
                                </p>
                            ) : (
                                <div className="mt-6 overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    Fecha
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    Partido
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    Torneo
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    Planilla
                                                </th>
                                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    Acciones
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {games.map((game) => (
                                                <tr
                                                    key={game.id}
                                                    className="hover:bg-gray-50"
                                                >
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                                                        {formatDate(game.date)}
                                                        {game.day
                                                            ? ` (${game.day})`
                                                            : ""}
                                                        {game.time
                                                            ? ` ${game.time.slice(0, 5)}`
                                                            : ""}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-700">
                                                        <div className="font-medium">
                                                            {game.team_local?.name_team ||
                                                                "-"}{" "}
                                                            vs{" "}
                                                            {game.team_visitor?.name_team ||
                                                                "-"}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {game.category
                                                                ? `${game.category.name_category} ${game.category.genero_category}`
                                                                : game.phase_label}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-700">
                                                        {game.tournament
                                                            ?.name_tournament ||
                                                            "-"}
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                                                        {sheetStatus(game)}
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-right">
                                                        <Link
                                                            href={`/games/${game.id}/planilla`}
                                                        >
                                                            <Button
                                                                variant="primary"
                                                                size="sm"
                                                            >
                                                                Abrir planilla
                                                            </Button>
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
