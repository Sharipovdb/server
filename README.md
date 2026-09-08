# CrewMove Backend

Express + TypeScript backend for the CrewMove transportation service.

This is the baseline scaffold: application structure, configuration, error handling and a health
endpoint. Database access, authentication and domain endpoints land in follow-up tasks.

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

| Variable   | Required | Example       | Description                                  |
| ---------- | -------- | ------------- | -------------------------------------------- |
| `NODE_ENV` | yes      | `development` | One of `development`, `production`, `test`.  |
| `PORT`     | yes      | `3000`        | TCP port the HTTP server binds to (1–65535). |

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
**not** read `.env` — supply `NODE_ENV` and `PORT` through the real environment (Docker, Railway,
systemd, etc.):

```bash
NODE_ENV=production PORT=8080 npm start
```

## Scripts

| Script                 | Description                               |
| ---------------------- | ----------------------------------------- |
| `npm run dev`          | Start with watch mode and `.env` loading. |
| `npm run build`        | Compile TypeScript to `dist/`.            |
| `npm start`            | Run the compiled build.                   |
| `npm run typecheck`    | Type-check without emitting files.        |
| `npm run lint`         | Run ESLint.                               |
| `npm run lint:fix`     | Run ESLint and apply fixable rules.       |
| `npm run format`       | Format the repository with Prettier.      |
| `npm run format:check` | Verify formatting without writing.        |

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
```

Two conventions matter for everything built on top of this scaffold:

- **`app.ts` never calls `listen()`.** Tests import the app and drive it with supertest without
  binding a port.
- **Only `src/config` reads `process.env`.** Everywhere else calls `getConfig()`, so required
  variables are validated in one place at startup.
