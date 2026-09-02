import { type FormEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import {
	type CreateSessionFormValues,
	hasFormErrors,
	validateCreateSessionForm,
} from "../model/create-session";
import { useCreateSessionMutation } from "../model/use-create-session-mutation";

const EMPTY_VALUES: CreateSessionFormValues = { title: "", startsAtLocal: "" };

const TITLE_ERROR_ID = "create-session-title-error";
const STARTS_AT_ERROR_ID = "create-session-starts-at-error";

type CreateSessionFormProps = {
	onCreated: () => void;
};

export function CreateSessionForm({ onCreated }: CreateSessionFormProps) {
	const { t } = useTranslation("sessions");
	const [values, setValues] = useState<CreateSessionFormValues>(EMPTY_VALUES);
	const [showErrors, setShowErrors] = useState(false);
	const mutation = useCreateSessionMutation();

	// Derived during render: a message disappears as soon as its field becomes valid (AC-18).
	const errors = showErrors ? validateCreateSessionForm(values) : {};

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (mutation.isPending) {
			return;
		}

		// Re-run with a fresh clock: the form may have sat open across a minute boundary (Q-01).
		const submitErrors = validateCreateSessionForm(values, new Date());
		setShowErrors(true);
		if (hasFormErrors(submitErrors)) {
			return;
		}

		mutation.mutate(values, { onSuccess: () => onCreated() });
	}

	return (
		<form
			onSubmit={handleSubmit}
			noValidate
			className="flex flex-col gap-3 rounded border border-slate-200 bg-white p-4"
		>
			<h3 className="font-medium">{t("form.heading")}</h3>

			<div className="flex flex-col gap-1">
				<label htmlFor="create-session-title" className="text-sm font-medium">
					{t("form.title.label")}
				</label>
				<input
					id="create-session-title"
					type="text"
					value={values.title}
					aria-invalid={errors.title !== undefined}
					aria-describedby={errors.title ? TITLE_ERROR_ID : undefined}
					onChange={(event) => setValues({ ...values, title: event.target.value })}
					className="rounded border border-slate-300 px-2 py-1"
				/>
				{errors.title ? (
					<p id={TITLE_ERROR_ID} className="text-sm text-red-700">
						{t(`form.validation.${errors.title}`)}
					</p>
				) : null}
			</div>

			<div className="flex flex-col gap-1">
				<label htmlFor="create-session-starts-at" className="text-sm font-medium">
					{t("form.startsAt.label")}
				</label>
				<input
					id="create-session-starts-at"
					type="datetime-local"
					value={values.startsAtLocal}
					aria-invalid={errors.startsAt !== undefined}
					aria-describedby={errors.startsAt ? STARTS_AT_ERROR_ID : undefined}
					onChange={(event) =>
						setValues({ ...values, startsAtLocal: event.target.value })
					}
					className="rounded border border-slate-300 px-2 py-1"
				/>
				{errors.startsAt ? (
					<p id={STARTS_AT_ERROR_ID} className="text-sm text-red-700">
						{t(`form.validation.${errors.startsAt}`)}
					</p>
				) : null}
			</div>

			<button
				type="submit"
				disabled={mutation.isPending}
				className="self-start rounded bg-slate-900 px-3 py-1 text-sm text-white disabled:opacity-60"
			>
				{mutation.isPending ? t("form.pending") : t("form.submit")}
			</button>
		</form>
	);
}
