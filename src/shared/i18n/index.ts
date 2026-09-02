import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enCommon from "./locales/en/common.json";
import enSessions from "./locales/en/sessions.json";
import ruCommon from "./locales/ru/common.json";
import ruSessions from "./locales/ru/sessions.json";

export const defaultNS = "common";

export const resources = {
	en: { common: enCommon, sessions: enSessions },
	ru: { common: ruCommon, sessions: ruSessions },
} as const;

export const supportedLngs = Object.keys(resources) as Array<keyof typeof resources>;

void i18n.use(initReactI18next).init({
	resources,
	lng: "en",
	fallbackLng: "en",
	supportedLngs,
	defaultNS,
	ns: [defaultNS, "sessions"],
	interpolation: { escapeValue: false },
});

export default i18n;
