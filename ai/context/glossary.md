# Glossary

One name per concept across the business domain, the API contract, and the code. When a new
concept appears, add it here before a second spelling of it reaches the codebase.

## Domain Entities

| Domain term | API field / path | Code symbol | Notes |
| --- | --- | --- | --- |
| Training session | `/api/sessions`, `data[]` | `SessionSummary` | The list row shape. |
| Session details | `POST /api/sessions` `201` body | `SessionDetails` | `SessionSummary` plus `description`, `trainerNotes`, `createdAt`, `cancellation`. |
| Coach | `coach`, `coachId` | `CoachSummary` | Mock roster: `coach_01` Maya Brooks, `coach_02` Ethan Cole, `coach_03` Lena Ortiz. |
| Location / court | `location.name`, `location.address` | `LocationSummary` | Sent flat on create as `locationName` + `locationAddress`. |
| Capacity / booked | `capacity`, `bookedCount` | same | A session is `full` when the two are equal in the seed data; the mock does not compute it. |
| Start time | `startsAt` | `SessionSummary["startsAt"]` | ISO 8601 UTC on the wire, local time on screen. |
| Duration | `durationMinutes` | same | Minutes, always greater than zero. |
| Status | `status`, `?status=` | `SessionStatus`, `SESSION_STATUSES` | `scheduled`, `full`, `cancelled`, `completed`. |
| Session type | `type` | `SessionType` | `training`, `camp`, `private`. |
| Visibility | `visibility` | `SessionVisibility` | `public`, `invite-only`. |
| List envelope | `{ data, meta }` | `SessionsListResponse` | `meta` is `{ page, pageSize, total }`; `total` counts the filtered result. |
| API error body | `{ error: { code, message, fieldErrors? } }` | `ApiErrorBody` | Typed for completeness; deliberately not rendered. |

## Code And Workspace Terms

| Term | Meaning |
| --- | --- |
| Workspace | The `/sessions` page: filter, create control, and the session list. `SessionsWorkspacePage`. |
| Feature barrel | `src/features/<feature>/index.ts`, the only import surface a feature exposes. |
| Endpoint wrapper | A typed function in `src/services/api/endpoints/*` that owns one API call. |
| Query key factory | `sessionKeys` (`all` / `lists()` / `list(params)`), the single source of cache keys. |
| Mock boundary | `src/mocks/`: MSW handlers, seed data, in-memory store, scenario switch. Nothing in the four layers imports it. |
| Seed | The five deterministic sessions in `src/mocks/data/sessions.seed.ts` (`ses_101`–`ses_105`). |
| Mock scenario | A `?mock=<name>` page-URL switch read by the mock boundary: `normal`, `empty`, `slow`, `list-error`, `list-error-once`, `create-error`. |
| Layer | One of `app`, `features`, `services`, `shared`. `mocks` and `test` are infrastructure, not layers. |

## Deliberate Non-Synonyms

* **Session** always means a training session. It never means an authentication session; no
  auth exists in this project.
* **Status** is the session lifecycle value. The loading/error/empty condition of a request is a
  **query state**, never a "status".
* **Mock scenario** is a boundary-side fault injection switch, not a feature flag: no code under
  `src/app`, `src/features`, `src/services`, or `src/shared` may read one.

See also: [`business-rules.md`](business-rules.md), [`product.md`](product.md).
