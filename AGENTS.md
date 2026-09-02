# React Accelerator — AGENTS.md

This repository is an ED (Evolutionary Design) small React SPA. Product context: a training
sessions workspace for a basketball academy (see `ai/context/product.md`).

## Read First

* `ARCHITECTURE.md` — layers, dependency rules, feature layout, tooling policies
* `.claude/skills/react-spa-best-practices/SKILL.md` — curated React SPA guidance for this repo
* `.claude/skills/` — accelerator role skills (`requirements-analyst`, `writing-plans`, `coder`,
  `code-reviewer`, `verify`, plus optional `architect`, `api-integration`, `ui-designer`,
  `test-generator`, `debugger`, `browser-verify`, `docs-generator`)
* `ai/context/` — persistent project memory. Only `product.md` exists today; add business
  rules, glossary, roadmap, current-work, and feature files as that knowledge appears
* `tasks/<task-id>/` — the active task brief and its role artifacts
* `training/` — onboarding task, assessment spec, API contract, and mocking guide

There is no example feature module yet. `src/app/` is the only wired layer; use the feature
layout in `ARCHITECTURE.md` section 7 when creating the first one.

## Tech Stack

* React 19, React Router 7 (library mode), TanStack Query 5
* Tailwind CSS 4 + shadcn/ui (Radix primitives)
* TypeScript 5.9 (strict), Vite 7
* i18next + react-i18next (`en` + `ru`)
* Manual API layer with typed fetch wrappers
* MSW 2 for the mock boundary, Vitest 4 + Testing Library for tests

## Non-Negotiables

* **NPM only** (no pnpm/yarn)
* **ED small layers**: `src/app`, `src/features`, `src/services`, `src/shared`
* **Strict import rules**:
    * features must NOT import app
    * services must NOT import app or features
    * shared must NOT import app, features, or services
    * nothing in the four layers imports from `src/mocks` or `src/test`
* **No scaffolding scripts exist.** Create features and routes by hand following
  `ARCHITECTURE.md`; do not invent `npm run scaffold:*` commands
* **No hardcoded UI strings** — i18n only (`en` + `ru`)
* **Biome is the single source of truth** for formatting and linting
* **Path alias**: `@/*` → `src/*`

## Scripts

* `npm run dev` — Vite dev server with the MSW worker enabled
* `npm run build` — `tsc -b && vite build`
* `npm run lint` / `npm run lint:fix` — Biome check
* `npm run format` — Biome format
* `npm run typecheck` — `tsc -b --noEmit`
* `npm run test` / `npm run test:watch` — Vitest

## Code Style (Biome)

* JS/TS indent: **tabs** (width 4)
* Other files indent: **2 spaces**
* Quotes: double
* Line width: 100
* Config file: `biome.jsonc` (at root)

## i18n Conventions

* Namespaces: `common` + per-feature namespace
* Any new UI text must add keys in BOTH `en` and `ru`
* Locale file location: `src/shared/i18n/locales/{en,ru}/{namespace}.json`
* Register new namespaces in the `resources` map in `src/shared/i18n/index.ts`

## Styling

* Tailwind CSS 4 utility classes + `cn()` utility (`src/shared/lib/cn.ts`)
* shadcn/ui components live in `src/shared/ui/`
* Global stylesheet: `src/index.css`
* No Material UI (MUI), styled-components, or CSS modules

## API & Data Fetching

* Use **Manual API mode only** (fetch client in `src/services/api/http.ts`, typed wrappers in
  `src/services/api/endpoints/*`)
* Use TanStack Query hooks in the feature `model/` directory
  (e.g. `src/features/<feature>/model/`)
* Never call raw fetch from feature UI
* Every endpoint gets an MSW handler in `src/mocks/handlers.ts`; the dev worker and the test
  server both read from that one list

## Testing

* Tests are colocated: `src/**/*.{test,spec}.{ts,tsx}`
* `src/test/setup.ts` starts the MSW node server with `onUnhandledRequest: "error"`
* Prefer behavior-level tests with Testing Library over implementation-detail tests

## React Implementation Choices

* Refer to `.claude/skills/react-spa-best-practices/SKILL.md` when making React choices.
* Do not introduce Next.js, RSC, or SWR assumptions into this client-only Vite SPA.
* Do not add `useMemo` or `useCallback` by default unless a real performance bottleneck or
  unstable reference issue is proven.
* Internal feature `index.ts` barrel files are allowed and expected as part of the architecture.
