# slash-fullstack-webapp-starter

Full-stack TypeScript starter (React Router v7 framework mode, shadcn/ui, Better Auth, Drizzle ORM, SQLite via `bun:sqlite`, Bun toolchain).

## Stack

- [React Router v7](https://reactrouter.com) — Framework mode with SSR, loaders, and actions
- [shadcn/ui](https://ui.shadcn.com) — Radix-based UI components with Tailwind CSS v4
- [Better Auth](https://better-auth.com) — Authentication (email/password + GitHub OAuth)
- [Drizzle ORM](https://orm.drizzle.team) — Type-safe SQL with [Bun’s built-in SQLite](https://bun.sh/docs/api/sqlite) (`bun:sqlite`)
- [Vitest](https://vitest.dev) — Testing framework
- [Vite](https://vite.dev) — Build tool

## Getting Started

Requires **[Bun](https://bun.sh)** (install, dev, build, tests, and production `start` all assume Bun — the app uses `bun:sqlite`, which Node does not provide).

```bash
bun install
cp .env.example .env.development   # set BETTER_AUTH_SECRET at minimum
bun run db:push     # push schema to SQLite
bun run dev         # start dev server on http://localhost:3000
```

## Scripts

| Script | Description |
|---|---|
| `dev` | Start development server |
| `build` | Production build |
| `start` | Apply pending DB migrations, then start production server |
| `lint` | ESLint (warnings do not fail the exit code; errors still fail) |
| `check` | TypeScript `tsc --noEmit` |
| `test` | Run tests in watch mode (uses `bunx --bun vitest` so `bun:sqlite` in tests resolves) |
| `test:run` | Run tests once |
| `db:generate` | Generate Drizzle migrations |
| `db:migrate` | Run Drizzle migrations |
| `db:push` | Push schema directly to DB |
| `db:studio` | Open Drizzle Studio |
| `typecheck` | Same as `check` |

## Environment Variables

- [`.env.example`](.env.example) — Template; copy to `.env.development` / `.env.production` (both gitignored) or use `.env*.local` overrides.
- `.env.development` — Development defaults (loaded automatically in dev)
- `.env.production` — Production config (loaded in production builds)

### CORS / cross-origin (previews, e2b, Slash, etc.)

This stack is configured to be **permissive** so random preview hosts work:

- **Better Auth** — [`trustedOrigins`](https://www.better-auth.com/docs/reference/options#trustedorigins) is **`["*"]`** (any origin) for `/api/auth/*`.
- **React Router** — [`react-router.config.ts`](react-router.config.ts) sets **`allowedActionOrigins: ['**']`** so cross-origin **`useFetcher` / form posts** to UI routes are not blocked by the framework’s origin check.
- **Server** — Root [**middleware**](app/root.tsx) and [**entry.server.tsx**](app/entry.server.tsx) add **`Access-Control-Allow-Origin: *`** (plus methods/headers) to responses; **`OPTIONS`** preflights get **204** from middleware.
- **Dev** — `bun run dev` runs **`react-router dev --cors`**.

`Access-Control-Allow-Origin: *` is **not** compatible with credentialed cross-origin requests that require a specific origin echo; same-site / same-origin auth cookies are the typical case. Tighten `trustedOrigins` and CORS headers in code when you deploy a locked-down production app.

### Production database migrations

On `bun run start`, the app runs [`scripts/migrate-runtime.mjs`](scripts/migrate-runtime.mjs) with **Bun** first. It uses Drizzle’s `bun-sqlite` migrator (not `drizzle-kit`) against the `drizzle/` SQL folder, then starts the production server with **Bun** as well (`react-router-serve` is invoked via `bun …/bin.js`). Pending migrations apply once; already-applied migrations are skipped via Drizzle’s journal table.

- **`SKIP_DB_MIGRATE_ON_START=1`** — Skip the runtime migrate step (e.g. multiple replicas, or you run migrations in CI only). The app must still match the DB schema.

Ensure the deployed image or working directory includes the committed **`drizzle/`** directory (SQL + `meta/`), not only `build/`.

## Deploying (e.g. Coolify + persistent SQLite)

Typical pattern:

1. **Persistent volume** — Mount a volume at the path used by `DATABASE_URL` (default `sqlite.db` in the app working directory), so data survives redeploys.
2. **Build** — `bun install` → `bun run build` from the repo root so `drizzle/` is present on disk when the container starts.
3. **Start command** — `bun run start` (migrations run automatically unless skipped). The runtime image must include **Bun** (the app uses `bun:sqlite`, which is not available under Node-only `react-router-serve`).
4. **Secrets** — Set `BETTER_AUTH_SECRET` (and OAuth vars if used) in Coolify env.

**Build / lint in Coolify:** Use **`bun run build`** as the build command. ESLint is tuned so common noise (unused variables, stylistic type rules, many `unsafe-*` checks, floating promises) reports as **warnings**, which **do not** fail `bun run lint`. If you add a lint step to the pipeline, **do not** pass `--max-warnings 0` unless you want warnings to fail the deploy. Avoid chaining `check` into build unless you intend type errors to block deploys.

**Single instance:** SQLite file DB is simplest with **one app replica** applying migrations. If you scale to multiple processes writing the same file, use `SKIP_DB_MIGRATE_ON_START=1` on all but one migrate job, or move to a server database.

**Storage:** Prefer local or block storage for the SQLite file. Network filesystems (some NFS setups) can be unreliable with SQLite.

Local development workflow is unchanged: edit `app/db/schema.ts`, run `bun run db:generate`, commit new files under `drizzle/`, then deploy.

If your local `sqlite.db` was created only with `db:push` and `start` fails because migrations try to create tables that already exist, either use a fresh database file or align the DB with Drizzle’s migration history (e.g. new dev DB + `db:migrate` once).

## Project Structure

```
app/
├── root.tsx            # Root layout
├── routes.ts           # Route configuration
├── routes/
│   ├── _index.tsx      # Home page (todo list with loader/action)
│   └── api.auth.$.ts   # Better Auth handler
├── components/ui/      # shadcn/ui components
├── db/schema.ts        # Drizzle schema
├── lib/
│   ├── auth.server.ts  # Better Auth server config
│   ├── trusted-origins.server.ts  # Better Auth trustedOrigins (allow all)
│   ├── open-cors.ts               # shared CORS header helpers
│   ├── auth-client.ts  # Better Auth client
│   ├── db.server.ts    # Database connection
│   └── utils.ts        # Utility functions
├── hooks/              # React hooks
└── styles/globals.css  # Tailwind CSS theme
tests/
└── todo.test.ts        # Example test
drizzle/                # Generated migrations (must ship to production)
scripts/
└── migrate-runtime.mjs # Runs before production start (Bun)
```
