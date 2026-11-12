import { confirmAction } from '@/Components/ConfirmationProvider';
import React from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import { Button, Input, Select, Text } from "@/Components/Atoms";
import PlayoffBracket, { BracketMatch } from "@/Components/PlayoffBracket/PlayoffBracket";

interface Combination {
    value: string;
    tournament_id: number;
    tournament_name: string;
    category_id: number;
    category_name: string;
    category_gender: string;
}

interface TeamStanding {
    position: number;
    team_id: number;
    team_name: string;
    matches_played: number;
    matches_won: number;
    matches_lost: number;
    sets_for: number;
    sets_against: number;
    classification_points: number;
    points_scored: number;
}

interface Props {
    combinations: Combination[];
    selectedCombination: Combination | null;
    standings: TeamStanding[];
    playoffBracket: { id: number; matches: BracketMatch[] } | null;
    bracketTeams: { id: number; name_team: string }[];
    playoffStages: Record<string, string>;
    canManagePlayoff: boolean;
}

export default function Standings({ combinations, selectedCombination, standings, playoffBracket, bracketTeams, playoffStages, canManagePlayoff }: Props) {
    const [editing, setEditing] = React.useState<number | null>(null);
    const [busy, setBusy] = React.useState(false);
    const [errors, setErrors] = React.useState<string[]>([]);
    const [search, setSearch] = React.useState("");
    const [stage, setStage] = React.useState("32avos");
    const [cup, setCup] = React.useState<"gold" | "silver">("gold");
    const [sideA, setSideA] = React.useState("");
    const [sideB, setSideB] = React.useState("");
    const [tournamentId, setTournamentId] = React.useState<number | null>(
        selectedCombination?.tournament_id ?? null
    );

    const tournaments = React.useMemo(() => {
        const seen = new Map<number, string>();
        combinations.forEach((combination) => {
            if (!seen.has(combination.tournament_id)) {
                seen.set(combination.tournament_id, combination.tournament_name);
            }
        });
        return Array.from(seen, ([id, name]) => ({
            tournament_id: id,
            tournament_name: name,
        }));
    }, [combinations]);

    React.useEffect(() => {
        setTournamentId(
            selectedCombination?.tournament_id ?? tournaments[0]?.tournament_id ?? null
        );
    }, [selectedCombination?.value, tournaments]);

    const activeTournamentId =
        tournamentId ?? selectedCombination?.tournament_id ?? tournaments[0]?.tournament_id ?? null;

    const categories = React.useMemo(
        () => combinations.filter((item) => item.tournament_id === activeTournamentId),
        [combinations, activeTournamentId]
    );

    const tournamentName =
        tournaments.find((item) => item.tournament_id === activeTournamentId)?.tournament_name ?? null;

    React.useEffect(() => {
        setSearch(""); setEditing(null); setSideA(""); setSideB(""); setErrors([]);
    }, [selectedCombination?.value]);

    const visibleStandings = React.useMemo(() => {
        const term = search.trim().toLowerCase();
        return standings.filter(
            (team) =>
                term === "" || team.team_name.toLowerCase().includes(term)
        );
    }, [standings, search]);

    const handleCombinationChange = (value: string) => {
        router.get("/standings", { combination: value }, { preserveScroll: true, replace: true });
    };

    const handleTournamentChange = (value: string) => {
        const nextTournamentId = Number(value);
        setTournamentId(nextTournamentId);
        const firstCategory = combinations.find(
            (combination) => combination.tournament_id === nextTournamentId
        );
        if (firstCategory) {
            router.get("/standings", { combination: firstCategory.value }, { preserveScroll: true, replace: true });
        }
    };

    const editMatch = (match: BracketMatch) => (() => { setEditing(match.id); setStage(match.stage); setCup(match.cup); setErrors([]); setSideA(match.team_a_id ? `team:${match.team_a_id}` : match.source_a_match_id ? `${match.source_a_type}:${match.source_a_match_id}` : ""); setSideB(match.team_b_id ? `team:${match.team_b_id}` : match.source_b_match_id ? `${match.source_b_type}:${match.source_b_match_id}` : ""); })();
    const deleteMatch = async (match: BracketMatch) => {
        if (!selectedCombination) return;
        if (!await confirmAction('¿Eliminar este cruce? Su partido se conservará.')) return;
        setBusy(true);
        router.delete(`/tournaments/${selectedCombination.tournament_id}/categories/${selectedCombination.category_id}/playoff-matches/${match.id}`, {
            preserveScroll: true,
            onFinish: () => setBusy(false),
            onError: e => setErrors(Object.values(e)),
            onSuccess: () => { setEditing(null); setSideA(""); setSideB(""); },
        });
    };

    const submitMatch = (event: React.FormEvent) => {
        event.preventDefault();
        if (!selectedCombination) return;
        const [selectedTournamentId, selectedCategoryId] = selectedCombination.value.split(":");
        const parseSide = (value: string) => {
            if (!value) return { team_id: null, source_type: null, source_match_id: null };
            const [kind, id] = value.split(":");
            return kind === "team"
                ? { team_id: Number(id), source_type: null, source_match_id: null }
                : { team_id: null, source_type: kind, source_match_id: Number(id) };
        };
        const a = parseSide(sideA);
        const b = parseSide(sideB);
        setBusy(true);
        router[editing ? "put" : "post"](`/tournaments/${selectedTournamentId}/categories/${selectedCategoryId}/playoff-matches${editing ? `/${editing}` : ""}`, {
            stage, cup,
            team_a_id: a.team_id, source_a_type: a.source_type, source_a_match_id: a.source_match_id,
            team_b_id: b.team_id, source_b_type: b.source_type, source_b_match_id: b.source_match_id,
        }, { preserveScroll: true, onFinish: () => setBusy(false), onError: e => setErrors(Object.values(e)), onSuccess: () => { setEditing(null); setErrors([]); setSideA(""); setSideB(""); } });
    };

    return (
        <AuthenticatedLayout>
            <Head title={tournamentName ?? "Tabla de posiciones"} />

            <div className="py-10 selection:bg-yellow-200">
                <div className="mx-auto max-w-7xl space-y-8 sm:px-6 lg:px-8">
                    <section className="overflow-hidden rounded-lg border-t-4 border-yellow-400 bg-white shadow-md">
                        <div className="p-6 text-slate-900 sm:p-8">
                            <Text variant="h1" color="primary">
                                {tournamentName ?? "No hay torneos disponibles"}
                            </Text>
                        </div>
                    </section>
                    <section className="overflow-hidden rounded-lg border-t-4 border-yellow-400 bg-white shadow-md">
                        <div className="border-b border-slate-100 px-5 py-5 sm:px-8">
                            <Text variant="h2" color="primary">Tabla de posiciones</Text>
                        </div>
                        {tournaments.length > 0 && (
                            <div className="space-y-4 px-5 pt-5 sm:px-8">
                                <div>
                                    <label htmlFor="standings-tournament" className="mb-2 block text-sm font-medium text-slate-700">Torneo</label>
                                    <Select id="standings-tournament" value={activeTournamentId ?? ""} onChange={event => handleTournamentChange(event.target.value)} className="max-w-xl">
                                        {tournaments.map(item => <option key={item.tournament_id} value={item.tournament_id}>{item.tournament_name}</option>)}
                                    </Select>
                                </div>
                                <div role="group" aria-label="Categorías" className="flex flex-wrap gap-3">
                                    {categories.map(item => (
                                        <Button key={item.value} onClick={() => handleCombinationChange(item.value)} aria-pressed={selectedCombination?.value === item.value}
                                            className={"focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 " + (selectedCombination?.value === item.value ? "ring-2 ring-primary ring-offset-2" : "hover:opacity-90")}>
                                            {item.category_name} ({item.category_gender})
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {selectedCombination && (
                            <div className="px-5 pt-5 sm:px-8">
                                <Input
                                    type="search"
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    placeholder="Buscar por equipo…"
                                    className="max-w-xl"
                                    aria-label="Buscar equipos en la tabla de posiciones"
                                />
                            </div>
                        )}

                        {selectedCombination ? (
                            standings.length > 0 ? (
                                visibleStandings.length > 0 ? (
                                <div className="mt-5 overflow-x-auto">
                                    <table className="min-w-full divide-y divide-slate-200">
                                        <thead className="bg-slate-50">
                                            <tr>
                                                {["Pos.", "Equipo", "PJ", "PG", "PP", "Sets a favor", "Sets en contra", "Puntos tabla", "Puntos anotados"].map((heading) => (
                                                    <th key={heading} scope="col" className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                                                        {heading}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 bg-white">
                                            {visibleStandings.map((team) => (
                                                <tr key={team.team_id} className="hover:bg-slate-50">
                                                    <td className="px-4 py-3 text-sm font-semibold text-slate-700">{team.position}</td>
                                                    <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-900">{team.team_name}</td>
                                                    <td className="px-4 py-3 text-sm text-slate-700">{team.matches_played}</td>
                                                    <td className="px-4 py-3 text-sm text-slate-700">{team.matches_won}</td>
                                                    <td className="px-4 py-3 text-sm text-slate-700">{team.matches_lost}</td>
                                                    <td className="px-4 py-3 text-sm text-slate-700">{team.sets_for}</td>
                                                    <td className="px-4 py-3 text-sm text-slate-700">{team.sets_against}</td>
                                                    <td className="px-4 py-3 text-sm font-semibold text-slate-900">{team.classification_points}</td>
                                                    <td className="px-4 py-3 text-sm text-slate-700">{team.points_scored}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                ) : (
                                    <p className="px-5 py-8 text-center text-sm text-slate-600 sm:px-8">
                                        Sin resultados para los filtros aplicados.
                                    </p>
                                )
                            ) : (
                                <p className="px-5 py-8 text-center text-sm text-slate-600 sm:px-8">
                                    Esta categoría todavía no tiene equipos registrados.
                                </p>
                            )
                        ) : (
                            <p className="px-5 py-8 text-center text-sm text-slate-600 sm:px-8">
                                {categories.length > 0 ? "Seleccioná una categoría para ver su tabla de posiciones." : "Todavía no hay categorías asociadas a torneos para mostrar."}
                            </p>
                        )}
                    </section>
                    {selectedCombination && <section className="overflow-hidden rounded-lg border-t-4 border-indigo-400 bg-white p-5 shadow-md sm:p-8">
                        <Text variant="h2" color="primary">Prode de play off</Text>
                        <p className="mt-1 text-sm text-slate-600">Cuadro de {selectedCombination?.category_name ?? "la categoría"}; los cruces muestran sus códigos para referenciar ganadores y perdedores.</p>
                        {canManagePlayoff && selectedCombination && (
                            <form onSubmit={submitMatch} className="mt-5 grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 md:grid-cols-2">
                                <label className="text-sm font-medium">Etapa<select className="mt-1 block w-full rounded border-slate-300" value={stage} onChange={(e) => setStage(e.target.value)}>{Object.entries(playoffStages).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
                                <label className="text-sm font-medium">Copa<select className="mt-1 block w-full rounded border-slate-300" value={cup} onChange={(e) => setCup(e.target.value as "gold" | "silver")}><option value="gold">Oro</option><option value="silver">Plata</option></select></label>
                                {([ [sideA, setSideA, "Equipo o resultado de cruce A"], [sideB, setSideB, "Equipo o resultado de cruce B"] ] as const).map(([value, setter, label], index) => (
                                    <label key={index} className="text-sm font-medium">{label}<select required className="mt-1 block w-full rounded border-slate-300" value={value} onChange={(e) => setter(e.target.value)}><option value="">Seleccione…</option><optgroup label="Equipos iniciales">{bracketTeams.map((team) => <option key={team.id} value={`team:${team.id}`}>{team.name_team}</option>)}</optgroup>{playoffBracket?.matches.length ? <optgroup label="Ganador o perdedor de">{playoffBracket.matches.map((match) => <React.Fragment key={match.id}><option value={`winner:${match.id}`}>Ganador {match.code}</option><option value={`loser:${match.id}`}>Perdedor {match.code}</option></React.Fragment>)}</optgroup> : null}</select></label>
                                ))}
                                <div className="md:col-span-2"><button disabled={busy} type="submit" className="rounded bg-indigo-700 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-800">{editing ? "Guardar cambios" : "Agregar cruce"}</button>{editing && <button type="button" onClick={() => { setEditing(null); setSideA(""); setSideB(""); setErrors([]); }}>Cancelar</button>}</div>
                            </form>
                        )}
                        {errors.map((error, i) => <p role="alert" className="text-red-600" key={i}>{error}</p>)}
                        <div className="mt-6">
                            <PlayoffBracket matches={playoffBracket?.matches ?? []} canManage={canManagePlayoff && !!selectedCombination} busy={busy} onEdit={editMatch} onDelete={deleteMatch} />
                        </div>
                    </section>}


                </div>
            </div>
        </AuthenticatedLayout>
    );
}
