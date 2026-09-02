import type { RequestHandler } from "msw";

/**
 * Feature request handlers are registered here.
 * Keep every mock behind this boundary so the HTTP client stays replaceable.
 */
export const handlers: RequestHandler[] = [];
