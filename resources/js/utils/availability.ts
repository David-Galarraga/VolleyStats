export interface Availability {
    id: number;
    id_fixture: number;
    id_team: number;
    date: string;
    start_time: string;
    end_time: string;
    team?: {
        id: number;
        name_team: string;
    };
}

export function toMinutes(time: string): number {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
}

export function fromMinutes(minutes: number): string {
    const clamped = Math.max(0, Math.min(minutes, 24 * 60 - 1));
    const hours = Math.floor(clamped / 60);
    const mins = clamped % 60;
    return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

export function overlaps(
    a: Pick<Availability, "start_time" | "end_time">,
    b: Pick<Availability, "start_time" | "end_time">
): boolean {
    // Intervalo semiabierto [start, end): contiguas no se solapan.
    // Mantener sincronizado con App\Services\AvailabilityService::overlaps().
    return (
        toMinutes(a.start_time) < toMinutes(b.end_time) &&
        toMinutes(b.start_time) < toMinutes(a.end_time)
    );
}

/** Un instante pertenece a la ventana si cae en [start, end). */
export function windowContainsTime(
    window: Pick<Availability, "start_time" | "end_time">,
    time: string
): boolean {
    const minutes = toMinutes(time);
    return (
        minutes >= toMinutes(window.start_time) &&
        minutes < toMinutes(window.end_time)
    );
}

export function intersection(
    a: Pick<Availability, "start_time" | "end_time">,
    b: Pick<Availability, "start_time" | "end_time">
): { start: string; end: string } | null {
    if (!overlaps(a, b)) return null;

    const start = Math.max(toMinutes(a.start_time), toMinutes(b.start_time));
    const end = Math.min(toMinutes(a.end_time), toMinutes(b.end_time));

    return { start: fromMinutes(start), end: fromMinutes(end) };
}

export function windowsForTeam(
    availabilities: Availability[],
    teamId: number,
    date: string
): Availability[] {
    const target = date.slice(0, 10);
    return availabilities.filter(
        (a) => a.id_team === teamId && a.date.slice(0, 10) === target
    );
}

export function compatibleOpponentIds(
    availabilities: Availability[],
    localTeamId: number,
    date: string
): Set<number> {
    // Espejo de App\Services\AvailabilityService::compatibleOpponentIds().
    // Mantener sincronizado.
    const target = date.slice(0, 10);
    const local = windowsForTeam(availabilities, localTeamId, target);
    const compatible = new Set<number>();

    for (const a of availabilities) {
        if (a.id_team === localTeamId || a.date.slice(0, 10) !== target)
            continue;
        if (local.some((w) => overlaps(w, a))) {
            compatible.add(a.id_team);
        }
    }

    return compatible;
}
