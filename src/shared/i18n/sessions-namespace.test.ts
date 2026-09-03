import { afterAll, describe, expect, it } from "vitest";
import i18n from "./index";
import enSessions from "./locales/en/sessions.json";
import ruSessions from "./locales/ru/sessions.json";

function collectKeys(value: unknown, prefix = ""): string[] {
	if (typeof value !== "object" || value === null) {
		return [prefix];
	}
	return Object.entries(value).flatMap(([key, child]) =>
		collectKeys(child, prefix ? `${prefix}.${key}` : key),
	);
}

afterAll(async () => {
	await i18n.changeLanguage("en");
});

describe("sessions i18n namespace", () => {
	it("defines exactly the same keys in en and ru", () => {
		expect(collectKeys(ruSessions).sort()).toEqual(collectKeys(enSessions).sort());
	});

	it("defines every key the feature renders", () => {
		expect(collectKeys(enSessions).sort()).toEqual(
			[
				"filter.all",
				"filter.label",
				"filter.scheduled",
				"form.heading",
				"form.open",
				"form.pending",
				"form.startsAt.label",
				"form.submit",
				"form.title.label",
				"form.validation.startsAtFuture",
				"form.validation.startsAtRequired",
				"form.validation.titleLength",
				"list.ariaLabel",
				"list.empty",
				"list.error.message",
				"list.error.retry",
				"list.heading",
				"list.loading",
				"list.startUnknown",
				"status.cancelled",
				"status.completed",
				"status.full",
				"status.scheduled",
			].sort(),
		);
	});

	it("resolves the namespace in english", () => {
		expect(i18n.t("sessions:list.error.message")).toBe(
			"Training sessions could not be loaded.",
		);
		expect(i18n.t("sessions:filter.all")).toBe("All");
	});

	it("resolves the namespace in russian without missing-key fallbacks", async () => {
		await i18n.changeLanguage("ru");

		expect(i18n.t("sessions:list.heading")).toBe("Тренировки");
		expect(i18n.t("sessions:filter.all")).toBe("Все");
		expect(i18n.t("sessions:form.title.label")).toBe("Название");
		expect(i18n.t("sessions:form.validation.titleLength")).toBe(
			"Введите название длиной от 3 до 80 символов.",
		);
		expect(i18n.t("sessions:list.error.message")).toBe("Не удалось загрузить тренировки.");
	});
});
