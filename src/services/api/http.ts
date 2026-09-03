/**
 * Single replaceable request boundary for the application.
 * Features must go through these helpers instead of calling `fetch` directly.
 */

export const API_BASE_URL = "/api";

export class HttpError extends Error {
	readonly status: number;
	readonly url: string;

	constructor(status: number, url: string, message?: string) {
		super(message ?? `Request failed with status ${status}`);
		this.name = "HttpError";
		this.status = status;
		this.url = url;
	}
}

type RequestOptions = Omit<RequestInit, "body"> & { body?: unknown };

async function request<TResponse>(path: string, options: RequestOptions = {}): Promise<TResponse> {
	const { body, headers, ...rest } = options;
	const url = `${API_BASE_URL}${path}`;

	const response = await fetch(url, {
		...rest,
		headers: {
			Accept: "application/json",
			...(body === undefined ? {} : { "Content-Type": "application/json" }),
			...headers,
		},
		...(body === undefined ? {} : { body: JSON.stringify(body) }),
	});

	if (!response.ok) {
		throw new HttpError(response.status, url);
	}

	if (response.status === 204) {
		return undefined as TResponse;
	}

	return (await response.json()) as TResponse;
}

export const http = {
	get: <TResponse>(path: string, options?: RequestOptions) =>
		request<TResponse>(path, { ...options, method: "GET" }),
	post: <TResponse>(path: string, body: unknown, options?: RequestOptions) =>
		request<TResponse>(path, { ...options, method: "POST", body }),
};
