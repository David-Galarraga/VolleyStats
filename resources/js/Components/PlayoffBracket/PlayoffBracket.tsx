import React from "react";

export interface BracketMatch {
    team_a_id: number | null; team_b_id: number | null;
    id: number; code: string; stage: string; cup: "gold" | "silver";
    team_a: string | null; team_b: string | null; result: string | null;
    score_a: number | null; score_b: number | null; winner_side: "a" | "b" | null;
    source_a_type: "winner" | "loser" | null; source_a_match_id: number | null; source_a_code: string | null;
    source_b_type: "winner" | "loser" | null; source_b_match_id: number | null; source_b_code: string | null;
}

type BracketSide = "left" | "center" | "right";

const STAGE_ORDER = ["32avos", "16avos", "Octavos", "Cuartos de final", "Semifinal", "Final"];
const STAGE_LABEL: Record<string, string> = { "Cuartos de final": "Cuartos" };
const CARD_HEIGHT = 188;
const ROW_STEP = 226;
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
    const thirdPlace = allMatches.filter((match) => match.cup === cup && match.stage === "3er puesto");
    const matches = allMatches.filter((match) => match.cup === cup && match.stage !== "3er puesto");
    if (!matches.length && !thirdPlace.length) {
        return { cup, matches, columns: [], placements: [], width: COLUMN_WIDTH, height: 72, finalPlacements: [] };
    }
    const presentStages = new Set(matches.map((match) => match.stage));
    const presentIndexes = [...presentStages].map((stage) => STAGE_ORDER.indexOf(stage)).filter((index) => index >= 0);
    const firstStageIndex = (presentIndexes.length ? Math.min(...presentIndexes) : 0);
    const lastStageIndex = (presentIndexes.length ? Math.max(...presentIndexes) : -1);
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

    const thirdTop = Math.max(maxY + CARD_HEIGHT + 90, champHeight + 40);
    thirdPlace.forEach((match, index) => placements.push({ match, side: "center", column: centerIndex, y: thirdTop + index * ROW_STEP }));
    return {
        cup,
        matches: [...matches, ...thirdPlace],
        columns,
        placements,
        width,
        height: Math.max(PANEL_HEADER_HEIGHT + STAGE_HEADER_HEIGHT + maxY + CARD_HEIGHT + 18, champHeight, thirdPlace.length ? thirdTop + thirdPlace.length * ROW_STEP : 0),
        finalPlacements,
    };
}

export interface PlayoffBracketProps {
    matches: BracketMatch[];
    canManage?: boolean;
    busy?: boolean;
    onEdit?: (match: BracketMatch) => void;
    onDelete?: (match: BracketMatch) => void;
}

export default function PlayoffBracket({ matches, canManage = false, busy = false, onEdit, onDelete }: PlayoffBracketProps) {
    const hostRef = React.useRef<HTMLDivElement>(null);
    const [paths, setPaths] = React.useState<{ key: string; d: string }[]>([]);
    const gold = React.useMemo(() => buildCupLayout("gold", matches), [matches]);
    const silver = React.useMemo(() => buildCupLayout("silver", matches), [matches]);
    const showGold = gold.matches.length > 0;
    const showSilver = silver.matches.length > 0;
    const silverTop = showGold ? gold.height + 32 : 0;
    const contentWidth = Math.max(showGold ? gold.width : 0, showSilver ? silver.width : 0, COLUMN_WIDTH);
    const contentHeight = (showGold ? gold.height : 0) + (showGold && showSilver ? 32 : 0) + (showSilver ? silver.height : 0);
    const matchesById = React.useMemo(() => new Map(matches.map((match) => [match.id, match])), [matches]);

    React.useLayoutEffect(() => {
        const host = hostRef.current;
        if (!host) return;

        const draw = () => {
            const hostRect = host.getBoundingClientRect();
            const nextPaths: { key: string; d: string }[] = [];

            (["gold", "silver"] as const).forEach((cup) => {
                matches.filter((target) => target.cup === cup).forEach((target) => {
                    ([ ["a", target.source_a_match_id, target.source_a_type], ["b", target.source_b_match_id, target.source_b_type] ] as const).forEach(([slot, sourceId, sourceType]) => {
                        if (!sourceId || sourceType !== "winner") return;
                        const source = matchesById.get(sourceId);
                        if (!validWinnerSource(target, source, sourceType)) return;

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
                        nextPaths.push({ key: `${cup}-${sourceId}-${target.id}-${slot}`, d: `M ${x1} ${y1} H ${mid} V ${y2} H ${x2}` });
                    });
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
                            className="absolute z-10 flex flex-col overflow-hidden rounded-md border border-slate-300 bg-white shadow-sm"
                            style={{ left: column * (COLUMN_WIDTH + COLUMN_GAP), top: top + y, width: COLUMN_WIDTH, minHeight: CARD_HEIGHT }}
                        >
                            <div className={`flex items-center justify-between border-b px-3 py-1.5 ${layout.cup === "gold" ? "border-yellow-200 bg-yellow-50" : "border-slate-200 bg-slate-50"}`}>
                                <span className="text-[11px] font-bold uppercase tracking-wide text-slate-600">{match.stage === "3er puesto" ? "3er puesto" : "Cruce"}</span>
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
                            {canManage && <div className="mt-auto flex justify-end gap-2 border-t border-slate-100 px-2 py-1.5">
                                <button type="button" disabled={busy} aria-label={`Editar cruce ${match.code}`} onClick={() => onEdit?.(match)} className="rounded px-2 py-1 text-[11px] font-medium text-indigo-700 hover:bg-indigo-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600 disabled:opacity-50">Editar</button>
                                <button type="button" disabled={busy} aria-label={`Eliminar cruce ${match.code}`} onClick={() => onDelete?.(match)} className="rounded px-2 py-1 text-[11px] font-medium text-red-600 hover:bg-red-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-600 disabled:opacity-50">Eliminar</button>
                            </div>}
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
                {showGold && renderCup(gold, 0)}
                {showSilver && renderCup(silver, silverTop)}
            </div>
        </div>
    );
}
