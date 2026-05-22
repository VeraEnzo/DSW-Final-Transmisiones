# Cajas Automáticas — Sistema de Gestión de Reparaciones

Aplicación web PWA para gestionar reparaciones de cajas automáticas de vehículos pesados (camiones, colectivos, tractores). Permite llevar el control completo del taller: clientes, cajas, reparaciones, presupuestos en PDF y fotos. Realizado para el examen final de la materia **Desarrollo de Software - UTN FRRO**.

---

## Stack Técnico

| Capa | Tecnología |
|---|---|
| Framework | React 18 + Vite 5 |
| Lenguaje | JavaScript (ES2024) |
| UI | Tailwind CSS + componentes propios |
| Auth | JWT (JSON Web Tokens) |
| Backend | Node.js + Express 4 |
| DB | PostgreSQL |
| Storage | Cloudinary (fotos en la nube) |
| PDF | PDFKit |
| PWA | vite-plugin-pwa + Workbox |
| Deploy | Vercel + Render + Neon |

---

## Funcionalidades

- Registro de clientes y cajas con historial completo de reparaciones.
- Flujo de estados dinámico: `ingresada → presupuestada → aprobada → terminada → entregada`.
- Presupuestos detallados con generación de PDF "al vuelo".
- Registro de trabajos realizados y repuestos utilizados.
- Galería de fotos por reparación con integración a la cámara del dispositivo móvil.
- Dashboard estadístico con resumen de órdenes por estado.
- Control de acceso por Roles: Autorización diferenciada para Administrador y Técnico.
- Soporte PWA: Instalable como aplicación nativa desde el navegador.

---

## Estructura del Proyecto

```text
/
├── client/          # Frontend (React + Vite)
└── server/          # Backend (Node.js + Express)
```

---

## Correr Localmente

### Requisitos
- Node.js 18+
- PostgreSQL
- Cuenta activa en Cloudinary (Configuración gratuita)

### 1. Instalar dependencias

```bash
cd server
npm install

cd ../client
npm install
```

### 2. Configurar variables de entorno

Copiá el archivo `server/.env.example` a `server/.env` y completá los valores correspondientes:

```env
PORT=3001
DATABASE_URL=postgresql://postgres:TU_PASSWORD@localhost:5432/cajas_automaticas
JWT_SECRET=un_secreto_largo_y_seguro
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

### 3. Crear la base de datos

Desde tu cliente de PostgreSQL (ej. psql o pgAdmin):
```sql
CREATE DATABASE cajas_automaticas;
```

### 4. Cargar datos iniciales (Seed)

```bash
cd server
node seed.js
```

**Credenciales de prueba generadas:**
| Email | Contraseña | Rol |
|---|---|---|
| `admin@taller.com` | `admin1234` | Admin |
| `tecnico@taller.com` | `tecnico1234` | Técnico |

### 5. Levantar la aplicación

**Terminal 1 (Servidor API):**
```bash
cd server
npm run dev
```

**Terminal 2 (Frontend React):**
```bash
cd client
npm run dev
```
Abrí `http://localhost:5173` en tu navegador.

---

## 🧪 Pruebas Automatizadas (Testing)

El proyecto cuenta con una estrategia de pruebas que cubre tanto la lógica de negocio en el backend como la interfaz de usuario.

### Backend (Tests de Integración)
Pruebas sobre endpoints y persistencia utilizando **Check/Jest** y **Supertest**.
```bash
cd server
npm test
```

### Frontend (Tests Unitarios y E2E)
* **Tests Unitarios (Vitest + RTL):** Validación de componentes y formularios críticos de manera aislada.
* **Tests End-to-End (Cypress):** Simulación de flujos de usuario completos (como el ciclo de autenticación).
```bash
cd client
npm run test          # Para correr Vitest
npm run cypress:open  # Para abrir la interfaz de Cypress
```

---

## 📄 Documentación Adicional

Para conocer en detalle el diseño técnico y los reportes de calidad, revisá los siguientes documentos adjuntos en la raíz:

* [**Documentación de la API (Backend)**](./docs/api-docs.md): Detalle de endpoints, métodos HTTP, parámetros requeridos y estructuras de respuestas JSON.
* [**Reporte de Tests (Frontend)**](./docs/tests-frontend.md): Casos de prueba detallados y evidencias de ejecución para Vitest y Cypress.
* [**Índice completo de documentación**](./docs/README.md): Propuesta, actas de avance, manual de usuario y más.

---

## Deploy

**Aplicación en producción:** [https://dsw-final-transmisiones.vercel.app](https://dsw-final-transmisiones.vercel.app)

El proyecto usa una arquitectura **multicloud gratuita e indefinida** con tres servicios separados:

| Capa | Plataforma | Plan |
|---|---|---|
| Frontend (React/Vite) | [Vercel](https://vercel.com) | Free — estático CDN |
| Backend (Express/Node) | [Render](https://render.com) | Free — 750hs/mes |
| Base de datos (PostgreSQL) | [Neon](https://neon.tech) | Free — 0.5 GB |

### Variables de entorno requeridas

**Render (Backend):**
```
DATABASE_URL        → Connection string SSL de Neon
JWT_SECRET          → Clave segura (mín. 32 caracteres)
CORS_ORIGIN         → URL del frontend en Vercel (ej: https://tu-app.vercel.app)
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
NODE_ENV            → production
```

**Vercel (Frontend):**
```
VITE_API_URL  → URL del backend en Render + /api (ej: https://tu-backend.onrender.com/api)
```
