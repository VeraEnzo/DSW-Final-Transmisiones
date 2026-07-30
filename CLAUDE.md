# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

PWA for managing automatic-transmission ("cajas automáticas") repairs for heavy vehicles. Two independent apps in one repo: `client/` (React + Vite frontend) and `server/` (Express + PostgreSQL API). Domain language and UI text are in **Spanish** — match that convention in new code (entity names like `reparaciones`, `cajas`, `presupuesto`, status enums, error messages).

## Commands

All commands run from the **repo root** unless noted. Each app has its own `package.json`; the root `package.json` only orchestrates.

```bash
npm run install:all      # install root + server + client deps
npm run dev              # run server + client concurrently (server:3001, client:5173)
npm run seed             # reset & seed DB (runs server/seed.js → applies schema.sql + sample data)
```

Server (`cd server`):
```bash
npm run dev              # nodemon
npm test                 # jest --runInBand --forceExit (integration tests, needs a real Postgres test DB)
npx jest tests/auth.test.js          # run a single test file
npx jest -t "nombre del test"        # run tests matching a name
```

Client (`cd client`):
```bash
npm run dev              # vite dev server (proxies /api → localhost:3001)
npm run build            # vite build (output for Vercel)
npm run test             # vitest (jsdom + RTL)
npm run test:e2e         # cypress run (headless; needs dev servers up)
npm run cypress:open     # cypress interactive
```

## Environment & test DB

Server reads `.env` (see `server/.env.example`): `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN` (comma-separated origins; falls back to allow-all if unset), `CLOUDINARY_*`, `NODE_ENV`.

Backend tests do **not** mock the DB. `tests/jest.setup.env.js` rewrites `DATABASE_URL` from `cajas_automaticas` → `cajas_automaticas_test` at load time, so tests hit a separate real Postgres database that must exist and have the schema applied. `tests/setup.js` exposes `cleanDB()` (TRUNCATE … RESTART IDENTITY) and `createAdminAndLogin` / `createTecnicoAndLogin` helpers that register via the API and return a JWT.

Client tests/E2E mock the network (RTL component tests, Cypress flows); no DB needed.

## Backend architecture

Layered Express app. Entry chain: `index.js` (loads dotenv, starts listener) → `src/app.js` (the composable app, exported for tests) → routes → controllers → `pg` pool.

- **`src/app.js`** mounts every router under `/api/<resource>` and registers `errorHandler` last. It is exported separately from the listener so Supertest can `request(app)` without binding a port.
- **ORM: Sequelize.** `src/config/sequelize.js` is the single shared Sequelize instance (same `DATABASE_URL` + conditional SSL as the legacy pool). `src/models/` holds one model per table (`Usuario`, `Cliente`, `Caja`, `Reparacion`, `ItemPresupuesto`, `ItemReparado`, `Foto`, `SolicitudReset`), each with `tableName` explicit and `timestamps: false` (the schema uses a manual `created_at`, not Sequelize's `createdAt`/`updatedAt`). **`src/models/index.js`** wires the associations (`hasMany`/`belongsTo`, e.g. `Cliente.hasMany(Caja)`, `Reparacion.hasMany(ItemPresupuesto)`) and re-exports everything plus `sequelize`. Import models from `../models`, never define the instance ad hoc.
- **`src/config/db.js`** is the legacy `pg` Pool, now used **only by `seed.js`** (which runs raw DDL/DML intentionally). Controllers do not use it.
- **Controllers** are the data layer. Each validates input with a **Zod** schema, queries via Sequelize models, and returns the uniform envelope `{ ok: true, data }` / `{ ok: false, error }`. Models map tables that already exist (`schema.sql` stays the source of truth) — **never call `sequelize.sync({ force })`**, it would drop data. For aggregates/subqueries (dashboard counts, `total_reparaciones`, `ultimo_estado`) use Sequelize `literal`/`fn`/`col`, and flatten included associations back to the original flat shape (`cliente_nombre`, `numero_serie`, …) so API responses are unchanged. Throw/`next(err)` for anything unexpected.
- **`src/middlewares/auth.js`** — `authenticate` verifies the `Bearer` JWT and sets `req.user` (`{ id, nombre, email, rol }`); `requireAdmin` gates admin-only routes on `req.user.rol === 'admin'`. Most routers call `router.use(authenticate)` at the top, then add `requireAdmin` per-route where needed (e.g. `DELETE /reparaciones/:id`, `POST /auth/register`).
- **`src/middlewares/errorHandler.js`** is the single error sink. It maps `ZodError` → 400 with field details, `SequelizeValidationError` → 400, `SequelizeUniqueConstraintError`/Postgres `23505` → 409 (duplicate), `SequelizeForeignKeyConstraintError`/`23503` → 400 (bad FK). New controllers should rely on this rather than formatting these errors locally.

### Cross-resource routing
`reparaciones.js` is the hub: it mounts sub-resource actions (presupuesto items, items reparados, fotos) under `/reparaciones/:id/...` by importing handlers from *other* controllers. The standalone `items.js` / `fotos.js` routers handle update/delete of those sub-resources by their own id. When adding a sub-resource action, follow this split: create-under-parent lives on the parent router, update/delete-by-id on the resource's own router.

### PDF generation
`src/utils/pdf.js` renders the budget ("presupuesto") PDF with **`@react-pdf/renderer`**, which is ESM-only. The server is CommonJS, so it is loaded via lazy `await import()` (cached in `_pdf`) and the document tree is built with `React.createElement` (aliased `el`), not JSX. `presupuestoController.getPDF` streams the result with `Content-Type: application/pdf`. Note: `pdfkit` is also a dependency but the active generator is `@react-pdf/renderer`. Jest mocks both `@react-pdf/*` packages via `moduleNameMapper`.

### Photos
`src/config/cloudinary.js` exports a memory-storage `multer` instance (`upload`, 10MB image-only) plus `uploadToCloudinary(buffer, folder)`. `fotosController.uploadFoto` is an **array middleware** `[upload.single('foto'), handler]` — the Cloudinary `secure_url` + `public_id` are persisted to the `fotos` table; deletes remove the Cloudinary asset first, then the row.

### Database
Schema lives in `server/schema.sql` (idempotent `CREATE TABLE IF NOT EXISTS`) and remains the source of truth — Sequelize models map these existing tables, they do not generate them. `seed.js` applies the schema, wipes data in FK order, resets sequences, and inserts demo users/clients/cajas/reparaciones (it uses the raw `pg` pool, not the ORM). Core entities: `usuarios` (roles `admin`/`tecnico`), `clientes`, `cajas`, `reparaciones`, `items_presupuesto`, `items_reparados`, `fotos`. The repair lifecycle is the `reparaciones.estado` enum: `ingresada → presupuestada → aprobada → terminada → entregada` (plus `rechazada`) — this enum is repeated in `schema.sql`, the Zod schema + Sequelize model validation (`Reparacion.js`), and the client's `SelectorEstado`/`BadgeEstado` components; keep them in sync when changing it. There are no `ON DELETE CASCADE` FKs on the main chain, so deletes manually remove children first (see `reparacionesController.remove`).

### Test database
Backend tests hit a separate real Postgres DB. `tests/jest.setup.env.js` rewrites `DATABASE_URL` by replacing `cajas_automaticas` → `cajas_automaticas_test` (so a local DB named `cajas_automaticas_utn` becomes `cajas_automaticas_test_utn`). That DB must exist with the schema applied before `npm test` works — create it from `postgres` and run `schema.sql` against it. The PDF test (`presupuesto.test.js`) mocks `src/utils/pdf` via `jest.mock` because `@react-pdf/renderer` is ESM-only and its dynamic `import()` is not interceptable by `moduleNameMapper`.

## Frontend architecture

React 18 + Vite, plain JS/JSX, Tailwind, `react-router-dom` v6. Structure: `pages/` (route screens), `components/` (shared UI), `contexts/AuthContext.jsx`, `hooks/`, `api/axios.js`.

- **`api/axios.js`** is the single configured Axios instance. `baseURL` = `VITE_API_URL` or `/api` (dev proxy → :3001, prod → Render). A request interceptor attaches the JWT from `localStorage`; a response interceptor on **401 (except the login call)** clears storage and hard-redirects to `/login`. Always import this instance, never raw `axios`.
- **`contexts/AuthContext.jsx`** holds `user` (hydrated from `localStorage`), `login`/`logout`, and `isAdmin`. Auth state lives entirely in `localStorage` (`token`, `user`) — there is no server session.
- **Routing/guards** live in `App.jsx`: the `RequireAuth` wrapper redirects unauthenticated users to `/login`, redirects non-admins away from `adminOnly` routes, and wraps the page in `<Layout>`. Add new protected screens as `<Route … element={<RequireAuth><Page/></RequireAuth>} />`.

## Deploy (multicloud)

Frontend → **Vercel** (static), Backend → **Render**, DB → **Neon** (Postgres). The Express server does **not** serve the frontend. Frontend needs `VITE_API_URL` = Render URL + `/api`; backend needs `CORS_ORIGIN` set to the Vercel URL. See README "Deploy" section for the full env var list.

## Further docs

`docs/` holds API reference (`api-docs.md`), test reports, and the user manual. README has full local-setup and seed-credentials details.
