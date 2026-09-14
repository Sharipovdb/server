# CrewMove Backend

Express + TypeScript backend for the CrewMove transportation service.

This is the baseline scaffold: application structure, configuration, error handling, a health
endpoint and a PostgreSQL database built from a Drizzle schema. Authentication and domain endpoints
land in follow-up tasks.

## Prerequisites

- **Node.js 24 or newer** (`node --version`). Node 24 runs TypeScript sources directly, so no
  `ts-node` or `nodemon` is needed in development.
- npm 11 or newer (ships with Node 24).

## Setup

```bash
git clone <repository-url>
cd CrewMoveNode
npm install
cp .env.example .env
createdb -U postgres crewmove_node
npm run db:migrate
```

`.env` is git-ignored. `.env.example` lists every variable the application requires; copy it and
adjust the values. The app refuses to start and prints the missing variable names if any are absent.

The database starts empty: `db:migrate` creates the `transportation` schema and every table.

## Environment variables

| Variable       | Required | Example                                                       | Description                                  |
| -------------- | -------- | ------------------------------------------------------------- | -------------------------------------------- |
| `NODE_ENV`     | yes      | `development`                                                 | One of `development`, `production`, `test`.  |
| `PORT`         | yes      | `3000`                                                        | TCP port the HTTP server binds to (1–65535). |
| `DATABASE_URL` | yes      | `postgresql://postgres:postgres@localhost:5432/crewmove_node` | PostgreSQL connection string.                |

## Running

### Development

```bash
npm run dev
```

Runs `src/server.ts` directly with `node --watch --env-file=.env`. The server restarts on file
changes and reads configuration from `.env`.

### Production

```bash
npm run build
npm start
```

`npm run build` compiles `src/` to `dist/` with `tsc`. `npm start` runs `dist/server.js` and does
**not** read `.env` — supply `NODE_ENV`, `PORT` and `DATABASE_URL` through the real environment
(Docker, Railway, systemd, etc.):

```bash
NODE_ENV=production PORT=8080 DATABASE_URL=postgresql://user:password@host:5432/db npm start
```

## Scripts

| Script                 | Description                                                       |
| ---------------------- | ----------------------------------------------------------------- |
| `npm run dev`          | Start with watch mode and `.env` loading.                         |
| `npm run build`        | Compile TypeScript to `dist/`.                                    |
| `npm start`            | Run the compiled build.                                           |
| `npm run typecheck`    | Type-check without emitting files.                                |
| `npm run lint`         | Run ESLint.                                                       |
| `npm run lint:fix`     | Run ESLint and apply fixable rules.                               |
| `npm run format`       | Format the repository with Prettier.                              |
| `npm run format:check` | Verify formatting without writing.                                |
| `npm run db:generate`  | Write a SQL migration for schema changes to `src/db/migrations/`. |
| `npm run db:migrate`   | Apply pending migrations to the database in `DATABASE_URL`.       |
| `npm run db:studio`    | Open Drizzle Studio.                                              |

## Database

The Node service owns its database, `crewmove_node`. The schema in `src/db/schema/` is the source of
truth: it is written by hand, one module per aggregate, and the database is built from it by the
migrations in `src/db/migrations/`. The C# service's database `transportation_db` stays untouched as
a read-only reference, and `drizzle.config.ts` refuses to run against it.

`src/db` exports one shared `db` instance backed by a single connection pool. The pool is created
when `src/db` is first imported and closed on `SIGINT` and `SIGTERM` after the HTTP server stops.

```ts
import { selectNotDeleted } from './db/index.ts';
import { tariffs } from './db/schema/index.ts';

const page = await selectNotDeleted(tariffs).orderBy(tariffs.name).limit(20);
```

- All tables live in the `transportation` schema. Table and column names match the C# database
  exactly, irregular ones such as `TaxiExpense` included; TypeScript exports and properties are
  camelCase (`taxiExpenses.paidById`).
- Every domain table shares `Id`, `CreatedAt`, `UpdatedAt` and `IsDeleted` (default `false`) through
  `baseEntityColumns`, the counterpart of `BaseEntity` in C#.
- `numeric` columns come back as strings (`"55.00"`), `date` columns as `YYYY-MM-DD` strings,
  `double precision` columns and `bigint` keys as numbers.
- Enums are stored as integers. Their values live in `src/db/enums.ts`, `TransportMode` starting at
  0 and every other enum at 1, and the enum columns are typed with them.

### Soft delete

Nothing is ever deleted. Every domain table has `IsDeleted`, a delete only flips it, and Drizzle has
no global filter. `src/db/soft-delete.ts` is the one place that hides deleted rows.

**Rule: never read a table that has `IsDeleted` with `db.select()`, `db.query.*` or `db.$count()`
directly, and never remove its rows with `db.delete()`.** Use the helpers from `src/db/index.ts`:

| Helper                            | What it does                                                                        |
| --------------------------------- | ----------------------------------------------------------------------------------- |
| `selectNotDeleted(table, where?)` | Select already filtered on `IsDeleted = false`; chain `orderBy`, `limit`, `offset`. |
| `findNotDeletedById(table, id)`   | One row, or `undefined` when it does not exist or is deleted.                       |
| `countNotDeleted(table, where?)`  | Row count for pagination totals.                                                    |
| `softDelete(table, where)`        | Sets `IsDeleted = true` and `UpdatedAt`, returns how many rows it flipped.          |
| `softDeleteById(table, id)`       | `false` when the row does not exist or is already deleted, which should become 404. |
| `notDeleted(table)`               | The bare condition, only for joined tables and `with` relations.                    |

Every helper takes a transaction as its last argument, so a cascade runs atomically:

```ts
await db.transaction(async (tx) => {
  await softDeleteById(crews, id, tx);
  await softDelete(crewMemberships, eq(crewMemberships.crewId, id), tx);
});
```

Unique indexes on names, plates and periods ignore deleted rows (`WHERE "IsDeleted" = false`), so a
deleted tariff's name can be used again. ASP.NET Identity tables have no `IsDeleted`, so the helpers
do not apply to them.

### Schema workflow

1. Change a table in `src/db/schema/`.
2. `npm run db:generate` writes a SQL migration to `src/db/migrations/`. Read it before applying.
3. `npm run db:migrate` applies it.

An applied migration is never edited; a fix is a new migration. Without schema edits `db:generate`
answers "No schema changes".

**Never run `drizzle-kit push`.** It forces the database to match the schema file and silently drops
everything the file does not describe.

## API

### `GET /health`

Smoke-test endpoint. Runs `select 1` against the database and returns `200` with the uptime in
seconds and the database state:

```bash
curl http://localhost:3000/health
```

```json
{ "status": "ok", "uptime": 12.408, "database": "up" }
```

When the database cannot be reached it returns `503`. A connection attempt gives up after 5 seconds.

```json
{ "status": "unavailable", "uptime": 12.408, "database": "down" }
```

Unmatched routes return `404` in the shared error shape:

```json
{ "error": { "status": 404, "message": "Route GET /nope not found" } }
```

## Project structure

```
src/
  app.ts          Builds and configures the Express app; exports it without listening
  server.ts       Reads config, starts the HTTP listener, closes server and pool on shutdown
  config/         Reads and validates process.env once, exported as a typed object
  routes/         Route definitions, mounted from app.ts
  controllers/    Request and response handling
  services/       Business logic, free of Express types
  middleware/     404 handler and the centralized error handler
  db/             Shared Drizzle client, soft-delete helpers, schema, migrations, enum values
```

Two conventions matter for everything built on top of this scaffold:

- **`app.ts` never calls `listen()`.** Tests import the app and drive it with supertest without
  binding a port.
- **Only `src/config` reads `process.env`.** Everywhere else calls `getConfig()`, so required
  variables are validated in one place at startup.
