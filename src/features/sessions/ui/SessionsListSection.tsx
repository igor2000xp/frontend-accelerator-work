import { useTranslation } from "react-i18next";
import type { SessionStatus } from "@/services/api/endpoints/sessions.types";
import { useSessionsQuery } from "../model/sessions-query";
import { SessionsList } from "./SessionsList";

type SessionsListSectionProps = {
	status: SessionStatus | undefined;
};

export function SessionsListSection({ status }: SessionsListSectionProps) {
	const { t } = useTranslation("sessions");
	const query = useSessionsQuery(status);

	if (query.isPending) {
		return (
			<p role="status" className="text-sm text-slate-600">
				{t("list.loading")}
			</p>
		);
	}

	if (query.isError) {
		return (
			<div role="alert" className="flex flex-col items-start gap-2">
				<p className="text-sm text-slate-800">{t("list.error.message")}</p>
				<button
					type="button"
					onClick={() => {
						void query.refetch();
					}}
					className="rounded border border-slate-300 bg-white px-3 py-1 text-sm"
				>
					{t("list.error.retry")}
				</button>
			</div>
		);
	}

	if (query.data.data.length === 0) {
		return <p className="text-sm text-slate-600">{t("list.empty")}</p>;
	}

	return <SessionsList sessions={query.data.data} />;
}
