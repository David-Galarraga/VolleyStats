import React from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import { Input, Select, Text } from "@/Components/Atoms";

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

interface BracketMatch {
    id: number; code: string; stage: string; cup: "gold" | "silver";
    team_a: string | null; team_b: string | null; result: string | null;
    score_a: number | null; score_b: number | null; winner_side: "a" | "b" | null;
    source_a_type: "winner" | "loser" | null; source_a_match_id: number | null; source_a_code: string | null;
    source_b_type: "winner" | "loser" | null; source_b_match_id: number | null; source_b_code: string | null;
}

type BracketSide = "left" | "center" | "right";

const STAGE_ORDER = ["32avos", "16avos", "Octavos", "Cuartos de final", "Semifinal", "Final"];
const STAGE_LABEL: Record<string, string> = { "Cuartos de final": "Cuartos" };
const CARD_HEIGHT = 148;
const ROW_STEP = 186;
const COLUMN_WIDTH = 232;
const COLUMN_GAP = 42;
const PANEL_HEADER_HEIGHT = 38;
const STAGE_HEADER_HEIGHT = 30;

interface MatchPlacement {
    match: BracketMatch;
    side: BracketSide;
    column: number;
    y: number;
}

interface CupLayout {
    cup: "gold" | "silver";
    matches: BracketMatch[];
    columns: { stage: string; side: BracketSide }[];
    placements: MatchPlacement[];
    width: number;
    height: number;
    finalPlacements: MatchPlacement[];
}

function nextStage(stage: string): string | null {
    const index = STAGE_ORDER.indexOf(stage);
    return index >= 0 && index < STAGE_ORDER.length - 1 ? STAGE_ORDER[index + 1] : null;
}

function validWinnerSource(target: BracketMatch, source: BracketMatch | undefined, sourceType: string | null): source is BracketMatch {
    return !!source && target.cup === source.cup && sourceType === "winner" && nextStage(source.stage) === target.stage;
}

function buildCupLayout(cup: "gold" | "silver", allMatches: BracketMatch[]): CupLayout {
    const matches = allMatches.filter((match) => match.cup === cup);
    if (!matches.length) {
        return { cup, matches, columns: [], placements: [], width: COLUMN_WIDTH, height: 72, finalPlacements: [] };
    }
    const presentStages = new Set(matches.map((match) => match.stage));
    const presentIndexes = [...presentStages].map((stage) => STAGE_ORDER.indexOf(stage)).filter((index) => index >= 0);
    const firstStageIndex = Math.min(...presentIndexes);
    const lastStageIndex = Math.max(...presentIndexes);
    const stageValues = STAGE_ORDER.slice(firstStageIndex, lastStageIndex + 1);
    const centerStage = stageValues.includes("Final") ? "Final" : stageValues[stageValues.length - 1];
    const byId = new Map(matches.map((match) => [match.id, match]));
    const sides = new Map<number, BracketSide>();
    const visited = new Set<string>();

    const validSourceFor = (target: BracketMatch, slot: "a" | "b"): BracketMatch | undefined => {
        const sourceId = slot === "a" ? target.source_a_match_id : target.source_b_match_id;
        const sourceType = slot === "a" ? target.source_a_type : target.source_b_type;
        const source = sourceId ? byId.get(sourceId) : undefined;
        return validWinnerSource(target, source, sourceType) ? source : undefined;
    };

    const assignBranch = (match: BracketMatch | undefined, side: "left" | "right") => {
        if (!match || match.stage === centerStage || visited.has(`${match.id}:${side}`)) return;
        visited.add(`${match.id}:${side}`);
        if (!sides.has(match.id)) sides.set(match.id, side);
        assignBranch(validSourceFor(match, "a"), side);
        assignBranch(validSourceFor(match, "b"), side);
    };

    const roots = matches.filter((match) => match.stage === centerStage).sort((a, b) => a.id - b.id);
    roots.forEach((match) => {
        sides.set(match.id, "center");
        assignBranch(validSourceFor(match, "a"), "left");
        assignBranch(validSourceFor(match, "b"), "right");
    });

    for (const stage of stageValues) {
        const unassigned = matches.filter((match) => match.stage === stage && !sides.has(match.id)).sort((a, b) => a.id - b.id);
        unassigned.forEach((match, index) => sides.set(match.id, index % 2 === 0 ? "left" : "right"));
    }

    const yPositions = new Map<number, number>();
    for (const stage of stageValues) {
        for (const side of ["left", "center", "right"] as const) {
            const group = matches.filter((match) => match.stage === stage && sides.get(match.id) === side).sort((a, b) => a.id - b.id);
            const candidates = group.map((match, index) => {
                const feederYs = [validSourceFor(match, "a"), validSourceFor(match, "b")]
                    .filter((source): source is BracketMatch => !!source)
                    .map((source) => yPositions.get(source.id))
                    .filter((position): position is number => position !== undefined);
                return { match, y: feederYs.length ? feederYs.reduce((sum, value) => sum + value, 0) / feederYs.length : index * ROW_STEP };
            }).sort((a, b) => a.y - b.y || a.match.id - b.match.id);

            let previous = -ROW_STEP;
            candidates.forEach(({ match, y }) => {
                const nextY = Math.max(y, previous + ROW_STEP);
                yPositions.set(match.id, nextY);
                previous = nextY;
            });
        }
    }

    const centerIndex = Math.max(0, stageValues.indexOf(centerStage));
    const outerStages = stageValues.slice(0, centerIndex);
    const columns = [
        ...outerStages.map((stage) => ({ stage, side: "left" as const })),
        ...(centerStage ? [{ stage: centerStage, side: "center" as const }] : []),
        ...outerStages.slice().reverse().map((stage) => ({ stage, side: "right" as const })),
    ];
    const placements = matches.map((match) => {
        const side = sides.get(match.id) ?? "left";
        const stageIndex = stageValues.indexOf(match.stage);
        const column = side === "center" ? centerIndex : side === "left" ? stageIndex : columns.length - 1 - stageIndex;
        return { match, side, column, y: PANEL_HEADER_HEIGHT + STAGE_HEADER_HEIGHT + (yPositions.get(match.id) ?? 0) };
    });
    const finalPlacements = placements.filter(({ match }) => match.stage === "Final");
    const maxY = Math.max(0, ...placements.map(({ y }) => y));
    const champHeight = finalPlacements.length ? Math.max(...finalPlacements.map(({ y }) => y + CARD_HEIGHT + 52)) : 0;
    const width = Math.max(COLUMN_WIDTH, columns.length * COLUMN_WIDTH + Math.max(0, columns.length - 1) * COLUMN_GAP);

    return {
        cup,
        matches,
        columns,
        placements,
        width,
        height: Math.max(PANEL_HEADER_HEIGHT + STAGE_HEADER_HEIGHT + maxY + CARD_HEIGHT + 18, champHeight),
        finalPlacements,
    };
}

function PlayoffCanvas({ matches }: { matches: BracketMatch[] }) {
    const hostRef = React.useRef<HTMLDivElement>(null);
    const [paths, setPaths] = React.useState<{ key: string; d: string }[]>([]);
    const gold = React.useMemo(() => buildCupLayout("gold", matches), [matches]);
    const silver = React.useMemo(() => buildCupLayout("silver", matches), [matches]);
    const silverTop = gold.height + 32;
    const contentWidth = Math.max(gold.width, silver.width);
    const contentHeight = silverTop + silver.height;
    const matchesById = React.useMemo(() => new Map(matches.map((match) => [match.id, match])), [matches]);

    React.useLayoutEffect(() => {
        const host = hostRef.current;
        if (!host) return;

        const draw = () => {
            const hostRect = host.getBoundingClientRect();
            const nextPaths: { key: string; d: string }[] = [];
            matches.forEach((target) => {
                ([ ["a", target.source_a_match_id, target.source_a_type], ["b", target.source_b_match_id, target.source_b_type] ] as const).forEach(([slot, sourceId, sourceType]) => {
                    if (!sourceId) return;
                    const source = matchesById.get(sourceId);
                    const isWinnerAdvance = validWinnerSource(target, source, sourceType);
                    if (!isWinnerAdvance || !source) return;

                    const sourceCard = host.querySelector<HTMLElement>(`[data-bracket-id="${sourceId}"]`);
                    const targetSlot = host.querySelector<HTMLElement>(`[data-bracket-slot="${target.id}:${slot}"]`);
                    if (!sourceCard || !targetSlot) return;
                    const outputSide = source.winner_side;
                    const outputSlot = outputSide ? host.querySelector<HTMLElement>(`[data-bracket-slot="${sourceId}:${outputSide}"]`) : null;
                    const sourceRect = (outputSlot ?? sourceCard).getBoundingClientRect();
                    const targetRect = targetSlot.getBoundingClientRect();
                    const sourceIsLeft = sourceRect.left + sourceRect.width / 2 <= targetRect.left + targetRect.width / 2;
                    const x1 = (sourceIsLeft ? sourceRect.right : sourceRect.left) - hostRect.left;
                    const x2 = (sourceIsLeft ? targetRect.left : targetRect.right) - hostRect.left;
                    const y1 = sourceRect.top + sourceRect.height / 2 - hostRect.top;
                    const y2 = targetRect.top + targetRect.height / 2 - hostRect.top;
                    const mid = x1 + (x2 - x1) / 2;
                    nextPaths.push({ key: `${sourceId}-${target.id}-${slot}`, d: `M ${x1} ${y1} H ${mid} V ${y2} H ${x2}` });
                });
            });

            matches.filter((match) => match.stage === "Final").forEach((finalMatch) => {
                const card = host.querySelector<HTMLElement>(`[data-bracket-id="${finalMatch.id}"]`);
                const champion = host.querySelector<HTMLElement>(`[data-champion-for="${finalMatch.id}"]`);
                if (!card || !champion) return;
                const winnerSlot = finalMatch.winner_side ? host.querySelector<HTMLElement>(`[data-bracket-slot="${finalMatch.id}:${finalMatch.winner_side}"]`) : null;
                const outputRect = (winnerSlot ?? card).getBoundingClientRect();
                const champRect = champion.getBoundingClientRect();
                const x = outputRect.left + outputRect.width / 2 - hostRect.left;
                const y1 = outputRect.bottom - hostRect.top;
                const y2 = champRect.top - hostRect.top;
                nextPaths.push({ key: `champion-${finalMatch.id}`, d: `M ${x} ${y1} V ${y2}` });
            });
            setPaths(nextPaths);
        };

        draw();
        const observer = new ResizeObserver(draw);
        observer.observe(host);
        window.addEventListener("resize", draw);
        return () => { observer.disconnect(); window.removeEventListener("resize", draw); };
    }, [matches, matchesById, contentWidth, contentHeight, silverTop]);

    if (!matches.length) return <p className="mt-4 text-sm text-slate-500">Todavía no hay cruces configurados para esta categoría.</p>;

    const renderCup = (layout: CupLayout, top: number) => (
        <React.Fragment key={layout.cup}>
            <div className={`absolute z-10 flex h-8 items-center px-3 text-sm font-bold ${layout.cup === "gold" ? "text-primary" : "text-slate-700"}`} style={{ left: 0, top, width: layout.width }}>
                {layout.cup === "gold" ? "Copa de Oro" : "Copa de Plata"}
            </div>
            {layout.columns.map((column, index) => (
                <div key={`${layout.cup}-${column.stage}-${column.side}`} className="absolute z-10 text-center" style={{ left: index * (COLUMN_WIDTH + COLUMN_GAP), top: top + PANEL_HEADER_HEIGHT, width: COLUMN_WIDTH }}>
                    <h4 className={`truncate px-2 text-xs font-bold uppercase tracking-wide ${column.side === "center" ? "text-primary" : "text-slate-600"}`}>
                        {column.stage === "Final" ? "Final" : STAGE_LABEL[column.stage] ?? column.stage}
                    </h4>
                </div>
            ))}
            {!layout.matches.length && <div className="absolute px-3 text-xs text-slate-500" style={{ left: 0, top: top + PANEL_HEADER_HEIGHT + 4 }}>Todavía no hay cruces de esta copa.</div>}
            {layout.placements.map(({ match, column, y }) => {
                const sourceLabel = (type: "winner" | "loser" | null, code: string | null) => type && code ? `${type === "winner" ? "Ganador" : "Perdedor"} ${code}` : null;
                const originA = sourceLabel(match.source_a_type, match.source_a_code);
                const originB = sourceLabel(match.source_b_type, match.source_b_code);
                const isFinal = match.stage === "Final";
                const winningTeam = match.winner_side === "a" ? match.team_a : match.winner_side === "b" ? match.team_b : null;
                return (
                    <React.Fragment key={`${layout.cup}-match-${match.id}`}>
                        <div
                            data-bracket-id={match.id}
                            className="absolute z-10 overflow-hidden rounded-md border border-slate-300 bg-white shadow-sm"
                            style={{ left: column * (COLUMN_WIDTH + COLUMN_GAP), top: top + y, width: COLUMN_WIDTH, minHeight: CARD_HEIGHT }}
                        >
                            <div className={`flex items-center justify-between border-b px-3 py-1.5 ${layout.cup === "gold" ? "border-yellow-200 bg-yellow-50" : "border-slate-200 bg-slate-50"}`}>
                                <span className="text-[11px] font-bold uppercase tracking-wide text-slate-600">Cruce</span>
                                <span className="rounded bg-primary px-2 py-0.5 text-xs font-bold text-white">{match.code}</span>
                            </div>
                            {([ ["a", match.team_a, match.score_a, originA], ["b", match.team_b, match.score_b, originB] ] as const).map(([slot, team, score, origin]) => {
                                const isWinner = match.winner_side === slot;
                                return <div key={slot} data-bracket-slot={`${match.id}:${slot}`} className={`flex min-h-9 items-center justify-between gap-2 border-b border-slate-100 px-3 py-1.5 last:border-b-0 ${isWinner ? "bg-yellow-50 font-semibold text-primary" : "text-slate-700"}`}>
                                    <span className="min-w-0">
                                        {origin && <span className="mr-1 block text-[10px] font-medium leading-3 text-slate-500">{origin}</span>}
                                        <span title={team ?? "Por definir"} className="line-clamp-2 block break-words text-xs leading-4">{team ?? "Por definir"}</span>
                                    </span>
                                    {score !== null && <span className="shrink-0 text-sm font-bold">{score}</span>}
                                </div>;
                            })}
                            {match.result === "WO" && <div className="border-t border-slate-100 px-3 py-1 text-right text-[10px] font-bold uppercase tracking-wide text-slate-500">WO</div>}
                        </div>
                        {isFinal && <div data-champion-for={match.id} className="absolute z-10 rounded-md border border-yellow-300 bg-yellow-50 px-3 py-2 text-center shadow-sm" style={{ left: column * (COLUMN_WIDTH + COLUMN_GAP) + 16, top: top + y + CARD_HEIGHT + 8, width: COLUMN_WIDTH - 32 }}>
                            <span className="block text-[10px] font-bold uppercase tracking-wide text-slate-600">Campeón {layout.cup === "gold" ? "de Oro" : "de Plata"}</span>
                            <span className="block truncate text-xs font-semibold text-primary">{winningTeam ?? "Por definir"}</span>
                        </div>}
                    </React.Fragment>
                );
            })}
        </React.Fragment>
    );

    return (
        <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200 bg-white">
            <div ref={hostRef} className="relative" style={{ width: contentWidth, height: contentHeight }}>
                <svg aria-hidden="true" className="pointer-events-none absolute inset-0 z-0" width={contentWidth} height={contentHeight}>
                    <defs>
                        <marker id="bracket-arrow-blue" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 8 4 L 0 8 z" fill="#0b178a" /></marker>
                    </defs>
                    {paths.map((path) => <path key={path.key} d={path.d} fill="none" stroke="#0b178a" strokeOpacity="0.65" strokeWidth="2" markerEnd="url(#bracket-arrow-blue)" />)}
                </svg>
                {renderCup(gold, 0)}
                {renderCup(silver, silverTop)}
            </div>
        </div>
    );
}

export default function Standings({ combinations, selectedCombination, standings, playoffBracket, bracketTeams, playoffStages, canManagePlayoff }: Props) {
    const [search, setSearch] = React.useState("");
    const [stage, setStage] = React.useState("32avos");
    const [cup, setCup] = React.useState<"gold" | "silver">("gold");
    const [sideA, setSideA] = React.useState("");
    const [sideB, setSideB] = React.useState("");

    React.useEffect(() => {
        setSearch("");
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

    const submitMatch = (event: React.FormEvent) => {
        event.preventDefault();
        if (!selectedCombination) return;
        const [tournamentId, categoryId] = selectedCombination.value.split(":");
        const parseSide = (value: string) => {
            if (!value) return { team_id: null, source_type: null, source_match_id: null };
            const [kind, id] = value.split(":");
            return kind === "team"
                ? { team_id: Number(id), source_type: null, source_match_id: null }
                : { team_id: null, source_type: kind, source_match_id: Number(id) };
        };
        const a = parseSide(sideA);
        const b = parseSide(sideB);
        router.post(`/tournaments/${tournamentId}/categories/${categoryId}/playoff-matches`, {
            stage, cup,
            team_a_id: a.team_id, source_a_type: a.source_type, source_a_match_id: a.source_match_id,
            team_b_id: b.team_id, source_b_type: b.source_type, source_b_match_id: b.source_match_id,
        }, { preserveScroll: true, onSuccess: () => { setSideA(""); setSideB(""); } });
    };

    return (
        <AuthenticatedLayout>
            <Head title={selectedCombination?.tournament_name ?? "Tabla de posiciones"} />

            <div className="py-10 selection:bg-yellow-200">
                <div className="mx-auto max-w-7xl space-y-8 sm:px-6 lg:px-8">
                    <section className="overflow-hidden rounded-lg border-t-4 border-yellow-400 bg-white shadow-md">
                        <div className="p-6 text-slate-900 sm:p-8">
                            <Text variant="h1" color="primary">
                                {selectedCombination?.tournament_name ?? "No hay torneos disponibles"}
                            </Text>
                        </div>
                    </section>
                    <section className="overflow-hidden rounded-lg border-t-4 border-indigo-400 bg-white p-5 shadow-md sm:p-8">
                        <Text variant="h2" color="primary">Prode de play off</Text>
                        <p className="mt-1 text-sm text-slate-600">Cuadro de {selectedCombination?.category_name ?? "la categoría"}; los cruces muestran sus códigos para referenciar ganadores y perdedores.</p>
                        {canManagePlayoff && selectedCombination && (
                            <form onSubmit={submitMatch} className="mt-5 grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 md:grid-cols-2">
                                <label className="text-sm font-medium">Etapa<select className="mt-1 block w-full rounded border-slate-300" value={stage} onChange={(e) => setStage(e.target.value)}>{Object.entries(playoffStages).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
                                <label className="text-sm font-medium">Copa<select className="mt-1 block w-full rounded border-slate-300" value={cup} onChange={(e) => setCup(e.target.value as "gold" | "silver")}><option value="gold">Oro</option><option value="silver">Plata</option></select></label>
                                {([ [sideA, setSideA, "Equipo o resultado de cruce A"], [sideB, setSideB, "Equipo o resultado de cruce B"] ] as const).map(([value, setter, label], index) => (
                                    <label key={index} className="text-sm font-medium">{label}<select required className="mt-1 block w-full rounded border-slate-300" value={value} onChange={(e) => setter(e.target.value)}><option value="">Seleccione…</option><optgroup label="Equipos iniciales">{bracketTeams.map((team) => <option key={team.id} value={`team:${team.id}`}>{team.name_team}</option>)}</optgroup>{playoffBracket?.matches.length ? <optgroup label="Ganador o perdedor de">{playoffBracket.matches.map((match) => <React.Fragment key={match.id}><option value={`winner:${match.id}`}>Ganador {match.code}</option><option value={`loser:${match.id}`}>Perdedor {match.code}</option></React.Fragment>)}</optgroup> : null}</select></label>
                                ))}
                                <div className="md:col-span-2"><button type="submit" className="rounded bg-indigo-700 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-800">Agregar cruce</button></div>
                            </form>
                        )}
                        <div className="mt-6">
                            <PlayoffCanvas matches={playoffBracket?.matches ?? []} />
                        </div>
                    </section>

                    <section className="overflow-hidden rounded-lg border-t-4 border-yellow-400 bg-white shadow-md">
                        <div className="border-b border-slate-100 px-5 py-5 sm:px-8">
                            <Text variant="h2" color="primary">Tabla de posiciones</Text>
                            {combinations.length <= 1 && selectedCombination && (
                                <Text variant="p" className="mt-2 text-slate-600">
                                    {selectedCombination.category_name} ({selectedCombination.category_gender})
                                </Text>
                            )}
                        </div>

                        {combinations.length > 1 && selectedCombination && (
                            <div className="px-5 pt-5 sm:px-8">
                                <label htmlFor="standings-combination" className="mb-2 block text-sm font-medium text-slate-700">
                                    Torneo y categoría
                                </label>
                                <Select
                                    id="standings-combination"
                                    value={selectedCombination.value}
                                    onChange={(event) => handleCombinationChange(event.target.value)}
                                    className="max-w-xl"
                                >
                                    {combinations.map((combination) => (
                                        <option key={combination.value} value={combination.value}>
                                            {combination.tournament_name} — {combination.category_name} ({combination.category_gender})
                                        </option>
                                    ))}
                                </Select>
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
                                Todavía no hay categorías asociadas a torneos para mostrar.
                            </p>
                        )}
                    </section>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
