# Architectural Blueprint: React SPA Accelerator (ED Small)

This document is the canonical architectural specification for the React Single Page
Application (SPA) Accelerator. It describes the modular organization, layer responsibilities,
dependency rules, and coding policies that keep the codebase maintainable, prevent technical
debt, and let human developers and AI assistants work on it predictably.

## 1. Architectural Philosophy: Evolutionary Design (ED) "Small"

This repository implements the Evolutionary Design (ED) "small" layout. Instead of a complex,
over-engineered structure, the project is organized into four top-level layers that separate
high-level composition from reusable business modules and low-level primitives.

The primary goals of this structure are to:

- Keep the project understandable and predictable as it scales.
- Prevent "import spaghetti" and cyclic dependencies.
- Let features operate as relatively independent blocks.
- Keep the repository easy for AI tools (Claude Code, Codex) to parse and work with.

## 2. Tech Stack

| Concern         | Choice                                                            |
| --------------- | ----------------------------------------------------------------- |
| UI              | React 19                                                          |
| Routing         | React Router 7 in library mode (`createBrowserRouter`)            |
| Server state    | TanStack Query 5                                                  |
| Styling         | Tailwind CSS 4 + shadcn/ui (Radix primitives), `cn()` helper      |
| Language        | TypeScript 5.9 (strict, `noUncheckedIndexedAccess`)               |
| Build / dev     | Vite 7                                                            |
| i18n            | i18next + react-i18next (`en` + `ru`)                             |
| API             | Manual typed fetch wrappers (no OpenAPI generation)               |
| Mocking         | MSW 2 (browser worker in dev, node server in tests)               |
| Testing         | Vitest 4 + jsdom + Testing Library                                |
| Lint / format   | Biome 2 (`biome.jsonc`)                                           |
| Package manager | npm only (no pnpm / yarn)                                         |

Path alias: `@/*` resolves to `src/*` (configured in `tsconfig.app.json` and `vite.config.ts`).

## 3. Top-Level Layout

```text
src/
├── main.tsx       # Bootstrap: starts the MSW worker in dev, mounts <App />
├── index.css      # Global stylesheet (Tailwind entry)
├── app/           # Global composition, wiring, and app entry point
├── features/      # Product-facing, independent functional slices
├── services/      # Shared cross-feature business capabilities (API, settings, auth)
├── shared/        # Generic UI primitives, helpers, and configurations (last resort)
├── mocks/         # MSW request handlers and worker/server setup (infrastructure)
└── test/          # Vitest global setup (infrastructure)
```

The four architectural layers are `app`, `features`, `services`, and `shared`. `mocks/` and
`test/` are infrastructure, not layers: see section 5.

### 3.1 `src/app/` (Composition Layer)

**Role:** the application composition "glue".

**What belongs here:**

- Global providers (`providers.tsx`: TanStack `QueryClientProvider`, `I18nextProvider`).
- Router setup (`router.tsx`: exports `routes` and the `createBrowserRouter` instance).
  Feature routes are registered as children of the root layout route.
- Root layout and root component (`AppLayout.tsx`, `App.tsx`).
- The application smoke test (`App.smoke.test.tsx`).

**Restrictions:**

- This is the most frequently changing layer because it manages global wiring.
- No business logic, feature-specific state machines, or endpoint-specific fetch logic.

### 3.2 `src/features/` (Functional Layer)

**Role:** the main layer where the vast majority of product-specific code lives.

**What belongs here:**

- Page components and route components.
- Feature-specific UI components.
- TanStack Query hooks (in the feature's `model/` directory).
- Feature-local state, view logic, and orchestration.
- Feature i18n namespace keys.

**Restrictions:**

- Features are independent modules.
- **CRITICAL:** features MUST NOT import anything from `app/`. `app` is highly volatile;
  importing it makes features fragile and risks cyclic dependencies.

### 3.3 `src/services/` (Business Services Layer)

**Role:** reusable, stateful business modules shared across multiple features.

**What belongs here:**

- The HTTP client (`api/http.ts`) and typed endpoint wrappers (`api/endpoints/*`).
- Session management, authentication, or shared settings modules.
- Reused capabilities required by multiple features.

**Restrictions:**

- No JSX-heavy UI components or route registrations.
- **CRITICAL:** services MUST NOT import anything from `app/` or `features/`.

### 3.4 `src/shared/` (Generic Layer)

**Role:** widely used, stateless building blocks.

**What belongs here:**

- UI primitives (shadcn/ui components are generated into `src/shared/ui/`).
- Tiny generic utilities (e.g. `src/shared/lib/cn.ts`).
- The i18n runtime and locale files (`src/shared/i18n/`).
- Stable configuration and system-wide constants.

**Restrictions:**

- `shared` is the "last resort". Prefer placing domain logic in a feature first.
- No domain-specific or feature-specific logic.
- **CRITICAL:** shared modules MUST NOT import anything from `app/`, `features/`, or
  `services/`.

## 4. Strict Dependency Flow

Dependencies flow unidirectionally downwards:

| Importer   | Allowed imports from          | Prohibited imports from       |
| ---------- | ----------------------------- | ----------------------------- |
| `app`      | `features`, `services`, `shared` | none (root composition)    |
| `features` | `services`, `shared`          | `app`                         |
| `services` | `shared`                      | `app`, `features`             |
| `shared`   | none                          | `app`, `features`, `services` |

## 5. Infrastructure Directories: `mocks/` and `test/`

These directories sit outside the four layers and follow their own rules.

**`src/mocks/`** is the single mock boundary for the HTTP client:

- `handlers.ts` holds every MSW request handler. Feature handlers are registered here.
- `browser.ts` starts the service worker in development only (called from `main.tsx`).
  The worker script lives at `public/mockServiceWorker.js`.
- `server.ts` creates the node server used by tests.
- Handlers may import types and constants from `services/` and `shared/` to stay aligned with
  the real API contract. Nothing under `app/`, `features/`, `services/`, or `shared/` may
  import from `mocks/`.

**`src/test/setup.ts`** wires the MSW node server into Vitest with `onUnhandledRequest: "error"`,
so any request a test does not mock fails loudly. Tests are colocated with the code they cover
and matched by `src/**/*.{test,spec}.{ts,tsx}`.

## 6. The Public API (Barrel Import) Rule

To encapsulate feature internals and prevent tight coupling:

- A feature exposes its public interface exclusively through `src/features/<feature>/index.ts`.
- Any external consumer (the router in `app/`, or another feature) imports from the feature
  only via that barrel file.
- Deep imports into feature internals (e.g. `import { X } from "@/features/auth/ui/button"`)
  are forbidden.

## 7. Feature Module Directory Layout

Every functional slice under `src/features/` should follow this structure, scaling naturally
as the feature grows:

```text
src/features/<feature>/
├── index.ts          # Public API (exports route components, hooks, etc.)
├── ui/               # UI components, views, and pages
├── model/            # TanStack Query hooks, state, local business rules
├── api/              # (Optional) Feature-specific endpoint adapters/wrappers
├── i18n/             # (Optional) Feature i18n namespace keys or local helpers
└── compose/          # (Optional) Internal orchestration glue to prevent cyclic imports
```

### When to use `compose/`

Introduce an internal `compose/` directory only when:

- UI components import heavily from `model/`, creating deep, messy dependencies.
- Orchestration logic is duplicated across multiple pages in the same feature.
- The feature needs a clear "smart container (orchestrator) + dumb presentation" split.

Do not create `compose/` preemptively.

## 8. Code Quality & Tooling Policies

### 8.1 Formatting & Linting (Biome)

- Biome is the single source of truth for formatting and linting.
- Configuration lives in `biome.jsonc` at the repository root. Its `$schema` points to
  `./node_modules/@biomejs/biome/configuration_schema.json` to keep the schema aligned with the
  installed version.
- JS/TS/TSX/JSX: tabs, width 4, double quotes, line width 100.
- JSON, JSONC, CSS, Markdown, and other files: 2 spaces.
- Accelerator tooling directories (`.claude/`, `.agents/`, `.codex/`, `rulesets/`,
  `toolchain/`, `.frontend-accelerator/`) and `public/` are excluded from Biome.

### 8.2 Localization / i18n Policy

- No hardcoded user-facing strings in JSX. All UI copy goes through react-i18next.
- Namespaces:
  - `common`: general, system-wide strings (buttons, layout headers).
  - `<feature>`: feature-specific copy.
- Any new string must be added in BOTH locales:
  - `src/shared/i18n/locales/en/<namespace>.json`
  - `src/shared/i18n/locales/ru/<namespace>.json`
- New namespaces are registered in the `resources` map in `src/shared/i18n/index.ts`.
- The default language and fallback are both `en`.

### 8.3 API & Fetching Policy (Manual Only)

- The project uses Manual API mode only. Automatic OpenAPI client generation is not used.
- The fetch client, base URL (`/api`), and `HttpError` live in `src/services/api/http.ts`.
- Typed endpoint wrappers live under `src/services/api/endpoints/*`.
- Components must not call `fetch` directly. All server state is accessed through TanStack
  Query hooks in the feature's `model/` directory, which call the endpoint wrappers.
- Every request and response payload is strictly typed. `any` is forbidden.
- Every endpoint used by a feature gets an MSW handler in `src/mocks/handlers.ts` so the app
  runs fully in local/mock mode.

### 8.4 React SPA Best Practices

- This is a client-only SPA. Do not introduce Next.js, React Server Components, or SWR
  assumptions.
- React Router 7 runs in library mode (`createBrowserRouter` + `RouterProvider`), not
  framework mode.
- Do not add `useMemo` or `useCallback` by default. Apply memoization only for a proven
  performance bottleneck or unstable reference issue.
- Every user flow must explicitly handle and translate loading, empty, success, and error
  states.
- Detailed guidance: `.claude/skills/react-spa-best-practices/SKILL.md`. Performance rules are
  vendored in `rulesets/framework/shared/react-best-practices/rules/`.

### 8.5 Scripts

```text
npm run dev        # Vite dev server (MSW worker enabled)
npm run build      # tsc -b && vite build
npm run preview    # Preview the production build
npm run lint       # biome check .
npm run lint:fix   # biome check --write .
npm run format     # biome format --write .
npm run typecheck  # tsc -b --noEmit
npm run test       # vitest run
npm run test:watch # vitest
```

## 9. The AI Repository Memory System

To keep developers and AI agents aligned, the repository maintains persistent project memory
under `ai/context/`. If a task changes product intent, business rules, vocabulary, feature
contracts, or architectural design, update the corresponding memory file in the same commit.

Currently present:

- `ai/context/product.md`: product purpose, target users, core flows, priorities, and
  out-of-scope boundaries.

Planned files (create them when the corresponding knowledge first appears):

- `ai/context/business-rules.md`: validation limits, statuses, and permissions that must hold
  across all screens and code.
- `ai/context/glossary.md`: shared naming between the business domain, API contracts, and code.
- `ai/context/roadmap.md`: what is being built Now, Next, and Later.
- `ai/context/current-work.md`: active work, recent commits, blockers, and handoff notes.
- `ai/context/features/<feature>.md`: a feature's passport: routes, API dependencies, local
  state, and edge cases.
- `ai/context/decisions/*.md`: Architectural Decision Records (ADRs) recording why a technical
  path was chosen, with alternatives and trade-offs.

## 10. "Where Should This Code Go?" Quick Decision Matrix

- Global configuration, router registration, or app-wide provider? `src/app/`
- A user-visible flow, page, or feature-specific interaction? `src/features/<feature>/`
- An API request, session helper, or business logic shared across features? `src/services/`
- A highly generic UI primitive, simple helper, or system constant? `src/shared/` (only after
  proving it does not belong to a specific feature)
- An MSW handler or mock fixture? `src/mocks/`
- Serves exactly one feature? Keep it in that feature. Do not move code down to `shared/` or
  `services/` "just in case". Prove reuse first.
