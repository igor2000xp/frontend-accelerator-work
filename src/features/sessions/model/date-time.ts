const LOCAL_DATE_TIME = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/;
const MS_PER_MINUTE = 60_000;

/** Parses a `datetime-local` value as local wall-clock time. Returns null when malformed. */
export function parseLocalDateTime(value: string): Date | null {
	const match = LOCAL_DATE_TIME.exec(value.trim());
	if (!match) {
		return null;
	}
	const [, year, month, day, hour, minute] = match;
	if (!year || !month || !day || !hour || !minute) {
		return null;
	}
	const date = new Date(
		Number(year),
		Number(month) - 1,
		Number(day),
		Number(hour),
		Number(minute),
		0,
		0,
	);
	return Number.isNaN(date.getTime()) ? null : date;
}

/** ISO 8601 UTC, second precision, e.g. `2027-03-14T17:30:00Z`. */
export function toIsoUtcSeconds(date: Date): string {
	return date.toISOString().replace(/\.\d{3}Z$/, "Z");
}

function startOfMinute(date: Date): number {
	return Math.floor(date.getTime() / MS_PER_MINUTE) * MS_PER_MINUTE;
}

/** True only when `value` is at least the next full minute after `now`. */
export function isFutureLocalDateTime(value: string, now: Date = new Date()): boolean {
	const parsed = parseLocalDateTime(value);
	if (!parsed) {
		return false;
	}
	return startOfMinute(parsed) > startOfMinute(now);
}

/** Renders an ISO UTC instant in the given timezone; omit `timeZone` for the user's own zone. */
export function formatSessionStart(
	isoUtc: string,
	options?: { locale?: string; timeZone?: string },
): string {
	return new Intl.DateTimeFormat(options?.locale ?? "en", {
		dateStyle: "medium",
		timeStyle: "short",
		timeZone: options?.timeZone,
	}).format(new Date(isoUtc));
}
