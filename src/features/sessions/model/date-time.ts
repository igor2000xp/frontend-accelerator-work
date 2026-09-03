const LOCAL_DATE_TIME = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/;
const MS_PER_MINUTE = 60_000;
const MAX_HOUR = 23;
const MAX_MINUTE = 59;

/**
 * Parses a `datetime-local` value as local wall-clock time.
 * Returns null when the value is malformed or names a calendar date that does not exist.
 */
export function parseLocalDateTime(value: string): Date | null {
	const match = LOCAL_DATE_TIME.exec(value.trim());
	if (!match) {
		return null;
	}
	const [, year, month, day, hour, minute] = match;
	if (!year || !month || !day || !hour || !minute) {
		return null;
	}

	const parsedYear = Number(year);
	const parsedMonth = Number(month);
	const parsedDay = Number(day);
	const parsedHour = Number(hour);
	const parsedMinute = Number(minute);

	// Range-check the clock components first: the Date constructor would otherwise carry an
	// out-of-range hour or minute into the calendar date (`T99:00` becomes "+4 days, 03:00").
	if (parsedHour > MAX_HOUR || parsedMinute > MAX_MINUTE) {
		return null;
	}

	const date = new Date(parsedYear, parsedMonth - 1, parsedDay, parsedHour, parsedMinute, 0, 0);
	if (Number.isNaN(date.getTime())) {
		return null;
	}

	// Reject any calendar component the constructor normalized away: month 13 rolls into the next
	// year, month 00 into the previous one, and Feb 30 into March. Hour and minute are deliberately
	// not round-tripped, so a DST spring-forward gap time still rolls to the next existing instant
	// on the same calendar day rather than being reported as an invalid date.
	if (
		date.getFullYear() !== parsedYear ||
		date.getMonth() !== parsedMonth - 1 ||
		date.getDate() !== parsedDay
	) {
		return null;
	}

	return date;
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

/**
 * Renders an ISO UTC instant in the given timezone; omit `timeZone` for the user's own zone.
 * Returns an empty string for an unparseable instant so that rendering a row can never throw and
 * escalate into the route-level error boundary; the caller shows translated placeholder copy.
 */
export function formatSessionStart(
	isoUtc: string,
	options?: { locale?: string; timeZone?: string },
): string {
	const instant = new Date(isoUtc);
	if (Number.isNaN(instant.getTime())) {
		return "";
	}
	return new Intl.DateTimeFormat(options?.locale ?? "en", {
		dateStyle: "medium",
		timeStyle: "short",
		timeZone: options?.timeZone,
	}).format(instant);
}
