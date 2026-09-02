/**
 * Single entry point through which colocated tests reach the mock boundary, so no file under the
 * four layers names `@/mocks`.
 */
export { resetSessionsDb } from "@/mocks/db/sessions-db";
export { CREATE_ERROR_BODY, LIST_ERROR_BODY } from "@/mocks/scenario";
export { server } from "@/mocks/server";
