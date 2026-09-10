# CrewMove Backend

Express + TypeScript backend for the CrewMove transportation service.

This is the baseline scaffold: application structure, configuration, error handling, a health
endpoint and typed access to the existing PostgreSQL database through Drizzle. Authentication and
domain endpoints land in follow-up tasks.

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
```

`.env` is git-ignored. `.env.example` lists every variable the application requires; copy it and
adjust the values. The app refuses to start and prints the missing variable names if any are absent.

## Environment variables

| Variable       | Required | Example                                                           | Description                                  |
| -------------- | -------- | ----------------------------------------------------------------- | -------------------------------------------- |
| `NODE_ENV`     | yes      | `development`                                                     | One of `development`, `production`, `test`.  |
| `PORT`         | yes      | `3000`                                                            | TCP port the HTTP server binds to (1–65535). |
| `DATABASE_URL` | yes      | `postgresql://postgres:postgres@localhost:5432/transportation_db` | PostgreSQL connection string.                |

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

| Script                 | Description                                                      |
| ---------------------- | ---------------------------------------------------------------- |
| `npm run dev`          | Start with watch mode and `.env` loading.                        |
| `npm run build`        | Compile TypeScript to `dist/`.                                   |
| `npm start`            | Run the compiled build.                                          |
| `npm run typecheck`    | Type-check without emitting files.                               |
| `npm run lint`         | Run ESLint.                                                      |
| `npm run lint:fix`     | Run ESLint and apply fixable rules.                              |
| `npm run format`       | Format the repository with Prettier.                             |
| `npm run format:check` | Verify formatting without writing.                               |
| `npm run db:pull`      | Regenerate `src/db/schema/` from the database in `DATABASE_URL`. |
| `npm run db:generate`  | Generate a migration from schema changes.                        |
| `npm run db:studio`    | Open Drizzle Studio.                                             |

## Database

The PostgreSQL database belongs to the .NET service, which created it with EF Core migrations.
Drizzle maps that database as it is: `src/db/schema/` is generated from the live database, not
written by hand.

```ts
import { getDb } from './db/index.ts';
import { crewsInTransportation } from './db/schema/schema.ts';

const crews = await getDb().select().from(crewsInTransportation);
```

- All tables live in the `transportation` schema. TypeScript properties are camelCase; table and
  column names in the database stay untouched, irregular ones such as `TaxiExpense` included.
- `numeric` columns come back as strings (`"55.00"`), `date` columns as `YYYY-MM-DD` strings,
  `double precision` columns and `bigint` keys as numbers.
- Enums are stored as integers. Their values live in `src/db/enums.ts`: `TransportMode` starts at
  0, every other enum at 1.
- Rows are never deleted, only flagged with `IsDeleted`, so every query has to filter on it.

### Schema workflow

- `npm run db:pull` runs `drizzle-kit pull`, then `scripts/fix-pulled-schema.ts` repairs known
  defects of the generated code, then Prettier formats it. Point it at the local database only. If
  the fix script reports that nothing matched, the generator output changed: review it and update
  the script.
- `src/db/schema/0000_*.sql` and `meta/0000_snapshot.json` are the baseline of the existing
  database. The SQL is commented out and must not be applied.
- `npm run db:generate` answers "No schema changes" until the schema is changed on purpose.
- **Never run `drizzle-kit push`.** It forces the database to match the schema file and silently
  drops everything the file does not describe.

## API

### `GET /health`

Smoke-test endpoint. Returns `200` with the process status and uptime in seconds.

```bash
curl http://localhost:3000/health
```

```json
{ "status": "ok", "uptime": 12.408 }
```

Unmatched routes return `404` in the shared error shape:

```json
{ "error": { "status": 404, "message": "Route GET /nope not found" } }
```

## Project structure

```
src/
  app.ts          Builds and configures the Express app; exports it without listening
  server.ts       Reads config, starts the HTTP listener, handles shutdown signals
  config/         Reads and validates process.env once, exported as a typed object
  routes/         Route definitions, mounted from app.ts
  controllers/    Request and response handling
  services/       Business logic, free of Express types
  middleware/     404 handler and the centralized error handler
  db/             Drizzle client, generated schema and integer enum values
scripts/          Tooling outside the application, such as the post-pull schema fixes
```

Two conventions matter for everything built on top of this scaffold:

- **`app.ts` never calls `listen()`.** Tests import the app and drive it with supertest without
  binding a port.
- **Only `src/config` reads `process.env`.** Everywhere else calls `getConfig()`, so required
  variables are validated in one place at startup.
