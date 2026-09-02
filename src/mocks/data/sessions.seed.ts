import type { CoachSummary, SessionSummary } from "@/services/api/endpoints/sessions.types";

const MAYA: CoachSummary = { id: "coach_01", name: "Maya Brooks", email: "maya@example.test" };
const ETHAN: CoachSummary = { id: "coach_02", name: "Ethan Cole", email: "ethan@example.test" };
const LENA: CoachSummary = { id: "coach_03", name: "Lena Ortiz", email: "lena@example.test" };

export const MOCK_COACHES: CoachSummary[] = [MAYA, ETHAN, LENA];

/** A fresh copy on every call, so no test can mutate the seed for another test. */
export function createSeedSessions(): SessionSummary[] {
	return [
		{
			id: "ses_101",
			title: "U14 Shooting Lab",
			type: "training",
			status: "scheduled",
			startsAt: "2027-08-03T16:00:00Z",
			durationMinutes: 90,
			capacity: 18,
			bookedCount: 14,
			visibility: "public",
			coach: { ...MAYA },
			location: { name: "North Court", address: "18 Harbor Street" },
			updatedAt: "2027-07-26T09:15:00Z",
		},
		{
			id: "ses_102",
			title: "Varsity Defense Intensive",
			type: "camp",
			status: "full",
			startsAt: "2027-08-04T13:30:00Z",
			durationMinutes: 180,
			capacity: 24,
			bookedCount: 24,
			visibility: "public",
			coach: { ...ETHAN },
			location: { name: "Central Sports Hall", address: "240 Market Avenue" },
			updatedAt: "2027-07-27T07:40:00Z",
		},
		{
			id: "ses_103",
			title: "Private Footwork Review",
			type: "private",
			status: "scheduled",
			startsAt: "2027-08-05T17:00:00Z",
			durationMinutes: 60,
			capacity: 1,
			bookedCount: 0,
			visibility: "invite-only",
			coach: { ...MAYA },
			location: { name: "Studio B", address: "18 Harbor Street" },
			updatedAt: "2027-07-25T15:20:00Z",
		},
		{
			id: "ses_104",
			title: "Weekend Ball Handling",
			type: "training",
			status: "cancelled",
			startsAt: "2026-08-08T09:00:00Z",
			durationMinutes: 75,
			capacity: 16,
			bookedCount: 9,
			visibility: "public",
			coach: { ...LENA },
			location: { name: "West Community Gym", address: "51 Pine Road" },
			updatedAt: "2026-07-27T11:05:00Z",
		},
		{
			id: "ses_105",
			title: "U12 Team Fundamentals",
			type: "training",
			status: "completed",
			startsAt: "2026-07-24T15:00:00Z",
			durationMinutes: 90,
			capacity: 20,
			bookedCount: 17,
			visibility: "public",
			coach: { ...ETHAN },
			location: { name: "Central Sports Hall", address: "240 Market Avenue" },
			updatedAt: "2026-07-24T17:10:00Z",
		},
	];
}
