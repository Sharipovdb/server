# CrewMove Backend

Express + TypeScript backend for the CrewMove transportation service.

The service has application structure, configuration, error handling, a health endpoint, a
PostgreSQL database built from a Drizzle schema, and login with JWT access and refresh tokens. Domain
endpoints land in follow-up tasks.

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
npm run db:seed
```

`.env` is git-ignored. `.env.example` lists every variable the application requires; copy it and
adjust the values. The app refuses to start and prints the missing variable names if any are absent.

The database starts empty: `db:migrate` creates the `transportation` schema and every table, and
`db:seed` adds the six roles and the administrator from `SEED_ADMIN_USERNAME` and
`SEED_ADMIN_PASSWORD`. Running the seeder again creates nothing new.

## Environment variables

| Variable                            | Required    | Example                                                       | Description                                                  |
| ----------------------------------- | ----------- | ------------------------------------------------------------- | ------------------------------------------------------------ |
| `NODE_ENV`                          | yes         | `development`                                                 | One of `development`, `production`, `test`.                  |
| `PORT`                              | yes         | `3000`                                                        | TCP port the HTTP server binds to (1–65535).                 |
| `DATABASE_URL`                      | yes         | `postgresql://postgres:postgres@localhost:5432/crewmove_node` | PostgreSQL connection string.                                |
| `JWT_SECRET`                        | yes         | a random string                                               | HS256 signing key for access tokens, at least 32 characters. |
| `JWT_ISSUER`                        | yes         | `TransportationBackend`                                       | `iss` claim of access tokens.                                |
| `JWT_AUDIENCE`                      | yes         | `TransportationClient`                                        | `aud` claim of access tokens.                                |
| `JWT_ACCESS_TOKEN_LIFETIME_MINUTES` | yes         | `15`                                                          | Access token lifetime in minutes.                            |
| `JWT_REFRESH_TOKEN_LIFETIME_DAYS`   | yes         | `7`                                                           | Refresh token lifetime in days.                              |
| `SEED_ADMIN_USERNAME`               | seeder only | `admin`                                                       | Administrator created by `npm run db:seed`.                  |
| `SEED_ADMIN_PASSWORD`               | seeder only | `change-me`                                                   | Password of that administrator, stored as a bcrypt hash.     |

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

`npm run build` compiles `src/` to `dist/` with `tsconfig.build.json`, which leaves the tests out.
`npm start` runs `dist/server.js` and does **not** read `.env` — supply every required variable from
the table above through the real environment (Docker, Railway, systemd, etc.).

## Scripts

| Script                 | Description                                                       |
| ---------------------- | ----------------------------------------------------------------- |
| `npm run dev`          | Start with watch mode and `.env` loading.                         |
| `npm run build`        | Compile TypeScript to `dist/`, tests excluded.                    |
| `npm start`            | Run the compiled build.                                           |
| `npm run typecheck`    | Type-check without emitting files.                                |
| `npm test`             | Run the test suite once against the test database.                |
| `npm run test:watch`   | Run the tests in watch mode.                                      |
| `npm run lint`         | Run ESLint.                                                       |
| `npm run lint:fix`     | Run ESLint and apply fixable rules.                               |
| `npm run format`       | Format the repository with Prettier.                              |
| `npm run format:check` | Verify formatting without writing.                                |
| `npm run db:generate`  | Write a SQL migration for schema changes to `src/db/migrations/`. |
| `npm run db:migrate`   | Apply pending migrations to the database in `DATABASE_URL`.       |
| `npm run db:seed`      | Create the roles and the administrator; safe to run again.        |
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

## Testing

Tests use Vitest and supertest and live next to the code as `*.test.ts`. They run against a separate
database:

```bash
createdb -U postgres crewmove_node_test
cp .env.test.example .env.test
npm test
```

`.env.test` is git-ignored. Before every run `src/test/global-setup.ts` drops the `transportation`
and `drizzle` schemas, applies the migrations and runs the seeder, so each run starts from a known
state. It refuses to touch a database whose name does not end in `_test`.

## API

Endpoint paths are copied from the C# service letter for letter, capitals and method name included
(`/api/Auth/login`, and later `/api/Crew/GetAll`), so the existing frontend keeps working unchanged.
Express matches routes case-insensitively, exactly as ASP.NET does, so `/api/auth/login` reaches the
same handler.

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

### `POST /api/Auth/login`

```json
{ "userName": "admin", "password": "change-me" }
```

The username is case-insensitive. A successful login returns:

```json
{
  "isSuccess": true,
  "statusCode": 200,
  "message": "Logged in successfully",
  "data": { "accessToken": "eyJhbGciOiJIUzI1NiIs...", "refreshToken": "q3JkZl8x..." }
}
```

### `POST /api/Auth/refresh`

```json
{ "refreshToken": "q3JkZl8x..." }
```

Returns a new pair in the same shape with `"message": null`. The old refresh token stops working.

Both endpoints follow the C# service: a failed login or refresh still answers HTTP `200`, and the
failure is in the body.

```json
{ "isSuccess": false, "statusCode": 400, "message": "Wrong username or password!", "data": null }
```

| Case                                  | `message`                     |
| ------------------------------------- | ----------------------------- |
| Wrong password or unknown user        | `Wrong username or password!` |
| Refresh token unknown or already used | `Invalid refresh token`       |
| Refresh token past its expiry         | `Refresh token expired`       |

A body without the required fields returns `400` in the shared error shape.

- The access token is HS256, signed with `JWT_SECRET`, with `iss`, `aud` and lifetime from `.env`.
  Claims: `sub` and `nameid` (user id), `unique_name`, `email`, `phone_number`, `telegramId` and
  `role`, an array of role names.
- The refresh token is 64 random bytes in Base64. Only its SHA-256 hash is stored in
  `AspNetUsers.RefreshToken`, with the expiry in `RefreshTokenExpiryTime`. A user holds one refresh
  token at a time: a new login replaces it.
- Passwords are stored as bcrypt hashes.

### Protecting endpoints

`currentUser` runs for every request from `app.ts`. When the request carries a valid
`Authorization: Bearer <token>` header it puts the user on `req.user`; a missing, broken or expired
token leaves the request anonymous instead of failing it. Two guards then enforce access, mirroring
`[Authorize]` and `[RoleAuthorize(...)]` in the C# service:

```ts
import { requireAuth, requireRole } from '../middleware/auth.middleware.ts';
import { RoleName } from '../shared/role-names.ts';

tariffRouter.use(requireAuth);
tariffRouter.get('/GetAll', requireRole(RoleName.Admin, RoleName.Accountant), getAllTariffs);
```

| Situation                                                        | Answer       |
| ---------------------------------------------------------------- | ------------ |
| No token, broken signature, expired token, wrong issuer/audience | `401`        |
| Valid token, but none of the listed roles                        | `403`        |
| Valid token with at least one of the listed roles                | handler runs |

`req.user` holds `{ id, userName, roles }` read from the token claims (`nameid`, `unique_name`,
`role`). There is no database query per request, exactly like `CurrentUserMiddleware` in C#, so a
role granted in the database reaches the API only after the user logs in again. Role names are
compared without case sensitivity, and `requireRole` answers `401` — not `403` — when there is no
user at all, the way ASP.NET does.

## Project structure

```
src/
  app.ts          Builds and configures the Express app; exports it without listening
  server.ts       Reads config, starts the HTTP listener, closes server and pool on shutdown
  config/         Reads and validates process.env once, exported as a typed object
  routes/         Route definitions, mounted from app.ts
  controllers/    Request and response handling
  services/       Business logic, free of Express types
  middleware/     Auth guards, 404 handler and the centralized error handler
  validation/     Request body parsing that rejects missing fields with 400
  dtos/           Request and response shapes shared by controllers and services
  repositories/   Data access for tables without soft delete, such as ASP.NET Identity users
  shared/         ApiResponse, errors, role names and name normalization
  types/          Type augmentation that puts the authenticated user on req.user
  db/             Shared Drizzle client, soft-delete helpers, schema, migrations, seeders, enums
  test/           Global test setup and helpers for integration tests
```

Two conventions matter for everything built on top of this scaffold:

- **`app.ts` never calls `listen()`.** Tests import the app and drive it with supertest without
  binding a port.
- **Only `src/config` reads `process.env`.** Everywhere else calls `getConfig()`, so required
  variables are validated in one place at startup.
