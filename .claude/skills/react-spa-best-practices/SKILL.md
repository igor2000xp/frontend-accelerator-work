---
name: react-spa-best-practices
description: "Curated React SPA guidance for this client-only Vite repository: state ownership, data fetching, routing, effects, and memoization."
phase: utility
flow-next: []
ruleset-aware: false
---

# React SPA Best Practices

## Purpose

Settle recurring React implementation choices in this repository so that `architect`, `coder`,
`ui-designer`, `test-generator`, `debugger`, and `code-reviewer` reach the same answer. This is a
reference skill: it decides *how* to write React here. It does not own scope, planning, or
verification.

## Scope

Applies to every file under `src/`. This is a **client-only Vite SPA**. There is no server
runtime, no request/response cycle, and no build-time data layer.

Never introduce, suggest, or assume:

- Next.js, its App Router, `next/*` imports, or file-system routing conventions;
- React Server Components, `"use server"`, server actions, or streaming SSR;
- SWR, Redux Toolkit Query, Apollo, or a second data-fetching library;
- `getServerSideProps`-shaped thinking about where data is loaded.

React Router 7 is used in **library mode** (`createBrowserRouter` + `RouterProvider`), not
framework mode. There is no `routes.ts`, no Vite plugin route generation, and no `clientLoader`
convention unless a separate architecture decision adds one.

## Performance Rules Live In The Ruleset

Do not restate rendering, re-render, bundle, async, or JS-idiom performance advice here. Twenty-one
curated rules are already vendored at:

```text
rulesets/framework/shared/react-best-practices/rules/
```

Read the specific rule file when a performance question arises — for example
`rerender-derived-state.md`, `rerender-lazy-state-init.md`, `rerender-transitions.md`,
`bundle-lazy-heavy-components.md`, `js-tosorted-immutable.md`. This skill covers the decisions
those rules deliberately leave open.

Known gap: `rulesets/framework/shared/react-best-practices/SOURCE.md` excluded
`client-tanstack-query-dedup.md` because the ruleset was vendored before this repository had
TanStack Query and the `services/api` + feature-`model/` layering. Those now exist, so the
request-deduplication guidance is carried in **Data Fetching** below instead. Do not edit the
Framework Ruleset to close this gap; that requires a separate product decision.

## State Ownership

Pick the owner before writing the state. Four owners, in this order of preference:

| Kind of state | Owner | Example |
| --- | --- | --- |
| Anything derivable from other state or props | nothing — compute during render | filtered list, `isEmpty`, validation message |
| Data that lives on the server | TanStack Query cache | the sessions list |
| State a user should be able to link to or reload into | `useSearchParams` | active status filter |
| Genuinely local, ephemeral UI state | `useState` in the nearest owner | is the create dialog open |

**Derive during render — do not mirror state into more state.**

Bad:

```tsx
const [sessions, setSessions] = useState<Session[]>([]);
const [visible, setVisible] = useState<Session[]>([]);

useEffect(() => {
	setVisible(sessions.filter((session) => session.status === status));
}, [sessions, status]);
```

Better:

```tsx
const visible = sessions.filter((session) => session.status === status);
```

The effect version renders twice, can render a stale list on the first pass, and adds a
synchronization bug for free. Filtering, sorting, formatting, totals, empty checks, and "is this
form valid" are all render-time computations.

Lift state only as far as the nearest component that needs it. Do not add a global store; this
repository has none, and server state belongs to TanStack Query rather than to a store.

## Data Fetching

Layering is fixed by `AGENTS.md` and must not be short-circuited:

```text
feature UI  ->  feature model/ hook  ->  services/api/endpoints/*  ->  services/api/http.ts
```

Feature components never call `fetch`, never import `msw`, and never build a URL. A component that
needs data calls the feature's own hook.

**1. Typed endpoint wrapper** — `src/services/api/endpoints/<resource>.ts`:

```ts
import { http } from "@/services/api/http";

export type Session = {
	id: string;
	title: string;
	status: SessionStatus;
	startsAt: string;
};

export function getSessions(): Promise<Session[]> {
	return http.get<Session[]>("/sessions");
}
```

**2. Query keys as a factory, colocated with the feature model.** Never spell a key inline at two
call sites — that is how invalidation silently misses.

```ts
export const sessionKeys = {
	all: ["sessions"] as const,
	list: (status: SessionStatus | "all") => [...sessionKeys.all, "list", status] as const,
};
```

**3. Query hook** in `src/features/<feature>/model/`:

```ts
export function useSessionsQuery(status: SessionStatus | "all") {
	return useQuery({
		queryKey: sessionKeys.list(status),
		queryFn: getSessions,
	});
}
```

**4. Read the status flags, do not invent your own.** `isPending` is the loading state and
`isError` is the recoverable error state. Do not track `loading` in `useState` beside a query, and
do not treat empty data as an error.

```tsx
if (query.isPending) return <SessionsSkeleton />;
if (query.isError) return <SessionsError onRetry={() => query.refetch()} />;
```

**5. Mutations invalidate; they do not hand-patch two sources of truth.**

```ts
const queryClient = useQueryClient();

const mutation = useMutation({
	mutationFn: createSession,
	onSuccess: async () => {
		await queryClient.invalidateQueries({ queryKey: sessionKeys.all });
	},
});
```

Awaiting `invalidateQueries` inside `onSuccess` keeps the mutation pending until the list has
actually refetched, so the UI never flashes a stale list after a successful create.

**6. Duplicate-submission control comes from the mutation, not from a boolean.** Disable the
submit control with `mutation.isPending`. When two submissions must never overlap even across
component instances, give the mutation a `scope`; TanStack Query then serializes mutations sharing
that scope id instead of running them concurrently.

```ts
const mutation = useMutation({
	mutationFn: createSession,
	scope: { id: "create-session" },
});
```

```tsx
<button type="submit" disabled={mutation.isPending}>
	{mutation.isPending ? t("state.saving") : t("action.create")}
</button>
```

**7. The mock boundary is MSW, and it stops at `src/mocks/`.** Handlers are registered in
`src/mocks/handlers.ts`, started in the browser for dev only from `src/mocks/browser.ts`, and
shared with Vitest through `src/mocks/server.ts`. Tests override behavior with `server.use(...)`
per test — they do not mock the endpoint module, and they do not stub `fetch`.

## Routing

`createBrowserRouter` returns a data router that **must be created once outside the React tree**.
Never build it inside a component or hold it in state; recreating it on render resets navigation
and loader state.

```tsx
// src/app/router.tsx
export const routes: RouteObject[] = [ /* ... */ ];
export const router = createBrowserRouter(routes);
```

Export the plain `routes` array as well as the router. Tests render `createMemoryRouter(routes)`,
which is the reason the array is a separate export.

Attach an `errorElement` to the top-level route so a thrown render error shows a recoverable
screen rather than a blank page. Split a route with `lazy: () => import("./Route")` only when the
route is genuinely heavy — see `bundle-lazy-heavy-components.md` before reaching for it.

Filter and query state that a user could reasonably bookmark or reload belongs in
`useSearchParams`, not in component state.

## Effects

Most components in this repository need no `useEffect` at all. Before writing one, check that it is
not one of these:

- **Transforming data for display** → compute during render.
- **Reacting to a user action** → put the logic in the event handler, where you know what happened.
  An effect only sees that a value changed, not which button caused it.
- **Fetching server data** → a TanStack Query hook.
- **Resetting state when a prop changes** → a `key` on the component.

A legitimate effect synchronizes with something outside React: a subscription, an event listener, a
timer, focus management, or an imperative browser API. Every such effect returns a cleanup
function. See `client-event-listeners.md` and `rerender-narrow-dependencies.md`.

## Memoization Policy

Do not add `useMemo`, `useCallback`, or `React.memo` by default. Add one only when you can name the
concrete problem it solves:

1. a measured render cost in a profile, or
2. a proven unstable reference — a value in a dependency array or a `memo`'d child's props that
   changes identity every render and demonstrably causes re-renders or effect churn.

"It might be expensive" is not a reason. Unjustified memoization is a review finding: it adds a
dependency array to keep correct, and a wrong one is a stale-value bug. Prefer the cheaper fixes
first — narrow the state, move it down, or compute less (`rendering-hoist-static-work.md`).

## Components And Files

- Feature-internal `index.ts` barrels are expected and correct; they are the feature's public
  surface. Do not add a barrel that re-exports across layer boundaries.
- Respect the import direction: `features` never import `app`; `services` never import `app` or
  `features`; `shared` imports none of them.
- A feature owns `ui/` (presentational), `model/` (queries, mutations, keys, derived logic), and
  its own i18n namespace.
- Keep components small enough that their states are obvious. If a component renders loading,
  error, empty, and populated inline and is hard to follow, split by state, not by line count.

## UI, i18n, And Accessibility

- Every user-visible string is an i18n key present in **both** `en` and `ru`. A literal in JSX is a
  defect, including button labels, `aria-label`s, and validation messages.
- Style with Tailwind utilities; compose conditional classes with `cn()` from `@/shared/lib/cn`.
  No CSS modules, styled-components, or MUI.
- Never encode meaning in color alone — pair a status color with a text label.
- Controls are real semantic elements: `<button type="submit">`, `<label htmlFor>`, a form that
  submits on Enter. Query the DOM in tests by role and accessible name, which only works if the
  markup is correct.
- Errors are recoverable: an error state offers a retry, and it says what failed.

## Review Checklist

- [ ] No state that could have been derived during render.
- [ ] No `useEffect` that a render-time computation, an event handler, or a query would replace.
- [ ] Server data flows UI -> `model/` hook -> endpoint -> `http.ts`; no `fetch` in a component.
- [ ] Query keys come from a factory; mutations invalidate the affected key.
- [ ] Loading and recoverable error states are rendered from `isPending` / `isError`.
- [ ] Submit controls are disabled while a mutation is pending.
- [ ] Router is created at module scope; `routes` is exported for tests.
- [ ] Every `useMemo` / `useCallback` / `memo` has a stated, real justification.
- [ ] All strings are i18n keys in `en` and `ru`.
- [ ] Import direction respects the ED layer rules.

## Sources

Verified against library documentation on 2026-09-02 through Context7. Re-verify with the project
adapter, never a global `ctx7`:

```bash
node ./toolchain/bin/ctx7.mjs library "<name>" "<specific question>"
node ./toolchain/bin/ctx7.mjs docs "<library-id>" "<specific question>"
```

- React — `/reactjs/react.dev`, "You Might Not Need an Effect", `<form>` / `useFormStatus`.
- TanStack Query v5 — `/tanstack/query`, `queryOptions` factories, invalidations from mutations,
  query status flags, and `scope.id` mutation serialization.
- React Router v7 — `/remix-run/react-router`, `createBrowserRouter` (data routers must not be held
  in React state), lazy route modules.

Repository stack at that date: React 19.2, React Router 7.18, TanStack Query 5.102, Tailwind 4.3,
i18next 26, Vite 7.3, TypeScript 5.9 strict, Vitest 4.1, MSW 2.15.
