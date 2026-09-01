# React Accelerator — AGENTS.md

This repository is an ED (Evolutionary Design) small React SPA

## Read First
* ARCHITECTURE.md
* .claude/skills/react-spa-best-practices/SKILL.md — curated React SPA guidance for this repo
* .claude/skills/ — local workflow skills such as add-feature, add-route-page, manual-api-endpoint, and update-memory
* ai/context/ — persistent project memory (read product, business rules, current work, and relevant feature files)
* ai/recipes/ — step-by-step recipes for common tasks (add feature, add route, add i18n namespace, etc.)
* ai/prompts/ — prompt starters for the team
* One existing feature module (src/features/home/) — use it as an example

## Tech Stack
* React 19, React Router 7, TanStack Query 5
* Tailwind CSS 4 + shadcn/ui (Radix primitives)
* TypeScript 5.9 (strict), Vite 7
* i18next (en + ru)
* Manual API layer with typed fetch wrappers

## Non-Negotiables
* **NPM only** (no pnpm/yarn)
* **ED small layers**: src/app, src/features, src/services, src/shared
* **Strict import rules**:
    * features must NOT import app
    * services must NOT import app or features
    * shared must NOT import app, features, or services
* **Prefer scaffolding commands** (`npm run scaffold:...`) before creating new features/routes manually
* **No hardcoded UI strings** — i18n only (en + ru)
* **Biome is the single source of truth** for formatting and linting
* **Path alias**: `@/*` → `src/*`

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

## Styling
* Tailwind CSS 4 utility classes + `cn()` utility (`src/shared/lib/cn.ts`)
* shadcn/ui components live in `src/shared/ui/`
* No Material UI (MUI), styled-components, or CSS modules

## API & Data Fetching
* Use **Manual API mode only** (fetch client in `src/services/api/http.ts`, typed wrappers in `src/services/api/endpoints/*`)
* Use TanStack Query hooks in feature `model/` directory (e.g., `src/features/<feature>/model/`)
* Never call raw fetch from feature UI

## React Implementation Choices
* Refer to `.claude/skills/react-spa-best-practices/SKILL.md` when making React choices.
* Do not introduce Next.js, RSC, or SWR assumptions into this client-only Vite SPA.
* Do not add useMemo or useCallback by default unless a real performance bottleneck or unstable reference issue is proven.
* Internal feature `index.ts` barrel files are allowed and expected as part of the architecture.

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

## Styling
* Tailwind CSS 4 utility classes + `cn()` utility (`src/shared/lib/cn.ts`)
* shadcn/ui components live in `src/shared/ui/`
* No Material UI (MUI), styled-components, or CSS modules

## API & Data Fetching
* Use **Manual API mode only** (fetch client in `src/services/api/http.ts`, typed wrappers in `src/services/api/endpoints/*`)
* Use TanStack Query hooks in feature `model/` directory (e.g., `src/features/<feature>/model/`)
* Never call raw fetch from feature UI

## React Implementation Choices
* Refer to `.claude/skills/react-spa-best-practices/SKILL.md` when making React choices.
* Do not introduce Next.js, RSC, or SWR assumptions into this client-only Vite SPA.
* Do not add useMemo or useCallback by default unless a real performance bottleneck or unstable reference issue is proven.
* Internal feature `index.ts` barrel files are allowed and expected as part of the architecture.
