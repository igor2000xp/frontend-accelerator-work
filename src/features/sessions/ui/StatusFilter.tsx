import { useTranslation } from "react-i18next";
import type { SessionStatus } from "@/services/api/endpoints/sessions.types";

/** D-01: the workspace offers `All` plus this single status. */
export const FILTER_STATUS: SessionStatus = "scheduled";

const ALL_VALUE = "all";

type StatusFilterProps = {
	value: SessionStatus | undefined;
	onChange: (value: SessionStatus | undefined) => void;
};

export function StatusFilter({ value, onChange }: StatusFilterProps) {
	const { t } = useTranslation("sessions");

	return (
		<label className="flex items-center gap-2 text-sm">
			<span className="font-medium">{t("filter.label")}</span>
			<select
				className="rounded border border-slate-300 bg-white px-2 py-1"
				value={value ?? ALL_VALUE}
				onChange={(event) => {
					onChange(event.target.value === FILTER_STATUS ? FILTER_STATUS : undefined);
				}}
			>
				<option value={ALL_VALUE}>{t("filter.all")}</option>
				<option value={FILTER_STATUS}>{t("filter.scheduled")}</option>
			</select>
		</label>
	);
}
