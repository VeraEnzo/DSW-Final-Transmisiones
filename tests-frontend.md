# Reporte de Tests — Frontend

Estrategia de pruebas del cliente React. Cubre dos niveles: tests unitarios de componentes con **Vitest + React Testing Library** y tests end-to-end con **Cypress**.

---

## Tests Unitarios (Vitest + React Testing Library)

Archivo: `client/src/pages/ReparacionNueva.test.jsx`

### Cómo ejecutarlos

```bash
cd client
npm run test
```

### Componente bajo prueba: `ReparacionNueva`

Formulario para crear una nueva orden de reparación a partir de una caja existente. Consume dos endpoints al montarse (`GET /cajas/:id` y `GET /usuarios`) y envía `POST /reparaciones` al guardar.

#### Estrategia de mockeo

Se aísla completamente el componente de sus dependencias externas:

| Dependencia | Mock aplicado |
|---|---|
| `api/axios` | `vi.mock` — se controlan las respuestas de `api.get` por URL |
| `AuthContext` | `vi.mock` — simula usuario `{ nombre: 'Técnico Test' }` |
| `react-router-dom` | `vi.mock` parcial — `useParams` retorna `{ id: '1' }`, `useNavigate` retorna función espiada |

---

### Caso 1: Renderizado correcto del formulario

**ID:** `UT-01`
**Descripción:** Verifica que todos los campos y el botón de acción se renderizan correctamente una vez que la API devuelve los datos de la caja.

**Precondiciones:**
- `GET /cajas/1` responde con `{ numero_serie: 'CAJA-123' }`
- `GET /usuarios` responde con un técnico

**Pasos:**
1. Renderizar `<ReparacionNueva />` dentro de `<BrowserRouter>`
2. Esperar a que aparezca el texto `CAJA-123` en pantalla

**Verificaciones:**
- El título `Nueva Reparación` está presente
- El número de serie `CAJA-123` se muestra
- El campo `Fecha de ingreso` existe en el DOM
- El campo `Técnico a cargo` existe en el DOM
- El campo `Falla declarada por el cliente` existe en el DOM
- El botón `Iniciar reparación` está presente

**Resultado esperado:** PASS

---

### Caso 2: Validación del campo fecha y estado del botón

**ID:** `UT-02`
**Descripción:** Verifica que el campo fecha tiene el atributo `required` y que el botón de submit no está deshabilitado en el estado inicial (la deshabilitación solo ocurre mientras el formulario se está guardando).

**Precondiciones:** iguales al caso 1.

**Pasos:**
1. Renderizar el componente
2. Esperar a que carguen los datos (`CAJA-123` visible)
3. Obtener el input de fecha y el botón de submit

**Verificaciones:**
- El input `Fecha de ingreso` tiene el atributo `required`
- El botón `Iniciar reparación` **no** está deshabilitado inicialmente

**Resultado esperado:** PASS

---

## Tests End-to-End (Cypress)

Archivo: `client/cypress/e2e/login.cy.js`

### Cómo ejecutarlos

```bash
cd client
npm run cypress:open   # Modo interactivo con navegador
```

> Requiere que tanto el backend (`localhost:3001`) como el frontend (`localhost:5173`) estén corriendo, y que la base de datos tenga los datos del seed cargados.

### Flujo bajo prueba: Autenticación de usuario

---

### Caso 3: Login exitoso como administrador

**ID:** `E2E-01`
**Descripción:** Un usuario administrador puede iniciar sesión con credenciales correctas y accede al Dashboard.

**Precondiciones:**
- El usuario `admin@taller.com` / `admin1234` existe en la base de datos (creado por el seed)
- La aplicación está corriendo en `http://localhost:5173`

**Pasos:**
1. Visitar `http://localhost:5173/`
2. Ingresar email: `admin@taller.com`
3. Ingresar password: `admin1234`
4. Interceptar `POST /api/auth/login` con alias `@loginRequest`
5. Hacer click en el botón de submit
6. Esperar la respuesta del alias `@loginRequest`

**Verificaciones:**
- El endpoint de login responde con `statusCode: 200`
- El texto `Nueva caja` es visible en la pantalla (confirma que se renderizó el Dashboard)

**Resultado esperado:** PASS

---

### Caso 4: Login fallido con credenciales incorrectas

**ID:** `E2E-02`
**Descripción:** Si el usuario ingresa una contraseña incorrecta, la aplicación muestra un mensaje de error sin redirigir.

**Precondiciones:** iguales al caso 3.

**Pasos:**
1. Visitar `http://localhost:5173/`
2. Ingresar email: `admin@taller.com`
3. Ingresar password: `clave_incorrecta`
4. Hacer click en el botón de submit

**Verificaciones:**
- El texto `Credenciales inválidas` es visible en pantalla

**Resultado esperado:** PASS

---

## Resumen de cobertura

| ID | Tipo | Componente / Flujo | Resultado |
|---|---|---|---|
| UT-01 | Unitario | `ReparacionNueva` — renderizado | PASS |
| UT-02 | Unitario | `ReparacionNueva` — validación fecha | PASS |
| E2E-01 | End-to-End | Login admin exitoso | PASS |
| E2E-02 | End-to-End | Login con credenciales incorrectas | PASS |

---

## Herramientas utilizadas

| Herramienta | Versión | Uso |
|---|---|---|
| Vitest | ^4.1.5 | Runner de tests unitarios |
| React Testing Library | ^16.3.2 | Renderizado y queries de componentes |
| @testing-library/jest-dom | ^6.9.1 | Matchers adicionales (`toBeInTheDocument`, etc.) |
| jsdom | ^29.1.5 | Simulación del DOM en Node.js |
| Cypress | ^15.14.2 | Tests end-to-end en navegador real |
