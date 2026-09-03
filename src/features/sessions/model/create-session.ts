import type { CreateSessionRequest } from "@/services/api/endpoints/sessions.types";
import { isFutureLocalDateTime, parseLocalDateTime, toIsoUtcSeconds } from "./date-time";

export const TITLE_MIN_LENGTH = 3;
export const TITLE_MAX_LENGTH = 80;

/** D-02: the seven contract fields the onboarding form does not collect. */
export const CREATE_SESSION_DEFAULTS = {
	type: "training",
	durationMinutes: 90,
	coachId: "coach_01",
	locationName: "North Court",
	locationAddress: "18 Harbor Street",
	capacity: 18,
	visibility: "public",
} as const satisfies Omit<CreateSessionRequest, "title" | "startsAt">;

export type CreateSessionFormValues = {
	title: string;
	/** Raw `datetime-local` value, local wall clock. */
	startsAtLocal: string;
};

/**
 * i18n key suffix, not copy: the UI renders `t(`form.validation.${error}`)`. Keeping the model
 * free of sentences is what makes the no-hardcoded-strings rule checkable in one place.
 */
export type CreateSessionFieldError = "titleLength" | "startsAtRequired" | "startsAtFuture";

export type CreateSessionFormErrors = {
	title?: CreateSessionFieldError;
	startsAt?: CreateSessionFieldError;
};

export function validateCreateSessionForm(
	values: CreateSessionFormValues,
	now: Date = new Date(),
): CreateSessionFormErrors {
	const errors: CreateSessionFormErrors = {};
	const title = values.title.trim();

	if (title.length < TITLE_MIN_LENGTH || title.length > TITLE_MAX_LENGTH) {
		errors.title = "titleLength";
	}

	if (values.startsAtLocal.trim() === "") {
		errors.startsAt = "startsAtRequired";
	} else if (!isFutureLocalDateTime(values.startsAtLocal, now)) {
		errors.startsAt = "startsAtFuture";
	}

	return errors;
}

export function hasFormErrors(errors: CreateSessionFormErrors): boolean {
	return errors.title !== undefined || errors.startsAt !== undefined;
}

/** Trims the title (AC-16) and converts the local wall clock to ISO 8601 UTC (A-04). */
export function buildCreateSessionRequest(values: CreateSessionFormValues): CreateSessionRequest {
	const startsAt = parseLocalDateTime(values.startsAtLocal);
	if (!startsAt) {
		throw new Error("startsAtLocal must be validated before building the request");
	}
	return {
		...CREATE_SESSION_DEFAULTS,
		title: values.title.trim(),
		startsAt: toIsoUtcSeconds(startsAt),
	};
}
