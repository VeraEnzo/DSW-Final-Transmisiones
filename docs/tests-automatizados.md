# Tests Automatizados — Backend

Suite de integración con **Jest + Supertest** que corre contra una base de datos de test real (`cajas_automaticas_test`). Cubre autenticación, clientes y presupuesto.

---

## Requisitos previos

1. Tener la base de datos de test creada:
   ```sql
   CREATE DATABASE cajas_automaticas_test;
   ```
2. Aplicar el mismo schema y extensiones que en producción:
   ```sql
   \c cajas_automaticas_test
   CREATE EXTENSION IF NOT EXISTS unaccent;
   -- luego correr el script de schema completo
   ```
3. Tener el archivo `.env` en `server/` con `DATABASE_URL` apuntando a la DB de producción — los tests la reemplazan automáticamente por `cajas_automaticas_test`.

---

## Cómo correr los tests

```bash
cd server
npm test
```

Los tests corren en serie (`--runInBand`) para evitar conflictos de estado en la DB, y fuerzan la salida al terminar (`--forceExit`).

---

## Arquitectura

### Separación app / servidor

`server/src/app.js` define la aplicación Express (rutas, middlewares) sin hacer `listen`. `server/index.js` solo arranca el servidor. Esto permite que Supertest importe la app sin abrir un puerto real.

### Base de datos de test

`tests/jest.setup.env.js` se ejecuta como `setupFiles` de Jest — antes de que cualquier módulo sea cargado. Allí se carga `.env` y se reemplaza `DATABASE_URL` para apuntar a `cajas_automaticas_test`. Esto garantiza que `db.js` cree su Pool con la URL correcta desde el primer `require`.

### Limpieza entre tests

`tests/setup.js` expone `cleanDB()`, que hace `TRUNCATE ... RESTART IDENTITY CASCADE` sobre todas las tablas antes de cada test. También expone helpers `createAdminAndLogin` y `createTecnicoAndLogin` que registran usuarios, los promueven por DB si hace falta, y devuelven el JWT.

### Mock de @react-pdf/renderer

`@react-pdf/renderer` es un paquete ESM-only y no puede cargarse con `require()` en el entorno CommonJS de Jest. Se configuró un `moduleNameMapper` en `package.json` que redirige las importaciones a stubs en `tests/__mocks__/`:

- `react-pdf-renderer.js` — exporta las funciones de la API (`Document`, `Page`, `View`, `Text`, `Image`, `StyleSheet`, `renderToBuffer`) con implementaciones mínimas que devuelven un Buffer con cabecera `%PDF-1.4`.
- `react-pdf-primitives.js` — objeto vacío (solo requerido por dependencias internas).

Esto permite testear el endpoint `/presupuesto/pdf` verificando el status code y el `Content-Type` sin generar un PDF real.

---

## Suites y casos

### `auth.test.js` — 7 tests

| # | Caso |
|---|------|
| 1 | Registro con datos válidos → 201, rol `tecnico` |
| 2 | Registro con email duplicado → 409, mensaje claro |
| 3 | Registro con contraseña menor a 6 caracteres → 400 |
| 4 | Login correcto → 200, token y datos de usuario |
| 5 | Login con contraseña incorrecta → 401 |
| 6 | Login con email inexistente → 401 |
| 7 | Ruta protegida sin token → 401 |

### `clientes.test.js` — 8 tests

| # | Caso |
|---|------|
| 1 | Crear cliente solo con nombre → 201, CUIT nulo |
| 2 | Crear cliente con todos los campos incluido CUIT → 201 |
| 3 | Crear cliente sin nombre → 400 |
| 4 | Listar todos los clientes → 200, cantidad correcta |
| 5 | Buscar por nombre sin tildes (unaccent) → 1 resultado |
| 6 | Buscar por empresa → 1 resultado |
| 7 | Actualizar CUIT de cliente existente → 200 |
| 8 | Admin elimina cliente sin cajas → 200, `deleted: true` |
| 9 | Técnico intenta eliminar cliente → 403 |
| 10 | Admin intenta eliminar cliente con cajas asociadas → 409 |

### `presupuesto.test.js` — 11 tests

| # | Caso |
|---|------|
| 1 | Agregar ítem con descripción y precio → 201 |
| 2 | Agregar ítem sin precio (precio nulo) → 201 |
| 3 | Agregar ítem sin descripción → 400 |
| 4 | Actualizar precio de ítem existente → 200 |
| 5 | Actualizar ítem inexistente → 404 |
| 6 | Eliminar ítem existente → 200, `deleted: true` |
| 7 | Eliminar ítem inexistente → 404 |
| 8 | Generar PDF → 200, `Content-Type: application/pdf` |
| 9 | Generar PDF de reparación inexistente → 404 |

**Total: 26 tests, 3 suites.**

---

## Evidencia de ejecución

Salida de `npm test` (ejecutado desde `server/`, contra la base de datos de test real):

```
> cajas-automaticas-server@1.0.0 test
> jest --runInBand --forceExit

PASS tests/auth.test.js
PASS tests/clientes.test.js
PASS tests/presupuesto.test.js

Test Suites: 3 passed, 3 total
Tests:       26 passed, 26 total
Snapshots:   0 total
Time:        10.297 s
Ran all test suites.
```

> El aviso `Force exiting Jest` que aparece al final proviene del flag `--forceExit` del script: el pool de conexiones a PostgreSQL queda abierto tras los tests y Jest fuerza la salida. Es informativo, no un fallo.

---

## Estructura de archivos

```
server/
├── src/
│   └── app.js                        # App Express sin listen (para Supertest)
├── tests/
│   ├── __mocks__/
│   │   ├── react-pdf-renderer.js     # Stub ESM → CJS
│   │   └── react-pdf-primitives.js   # Stub ESM → CJS
│   ├── jest.setup.env.js             # setupFiles: apunta DB_URL a test DB
│   ├── setup.js                      # cleanDB, createAdmin, createTecnico
│   ├── auth.test.js
│   ├── clientes.test.js
│   └── presupuesto.test.js
└── package.json                      # jest config: setupFiles + moduleNameMapper
```