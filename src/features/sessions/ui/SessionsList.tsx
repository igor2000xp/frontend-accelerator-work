import { useTranslation } from "react-i18next";
import type { SessionSummary } from "@/services/api/endpoints/sessions.types";
import { formatSessionStart } from "../model/date-time";

type SessionsListProps = {
	sessions: SessionSummary[];
};

export function SessionsList({ sessions }: SessionsListProps) {
	const { t, i18n } = useTranslation("sessions");

	return (
		<ul aria-label={t("list.ariaLabel")} className="flex flex-col gap-2">
			{sessions.map((session) => {
				// `formatSessionStart` returns "" rather than throwing on an unparseable instant,
				// so a malformed row degrades to translated copy instead of an empty line.
				const startLabel = formatSessionStart(session.startsAt, { locale: i18n.language });

				return (
					<li
						key={session.id}
						className="rounded border border-slate-200 bg-white px-4 py-3 shadow-sm"
					>
						<h3 className="font-medium">{session.title}</h3>
						<p className="text-sm text-slate-600">{t(`status.${session.status}`)}</p>
						<p className="text-sm text-slate-600">
							{startLabel === "" ? (
								t("list.startUnknown")
							) : (
								<time dateTime={session.startsAt}>{startLabel}</time>
							)}
						</p>
					</li>
				);
			})}
		</ul>
	);
}
