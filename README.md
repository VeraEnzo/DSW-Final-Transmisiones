# Cajas Automáticas — Sistema de Gestión de Reparaciones

Aplicación web PWA para gestionar reparaciones de cajas automáticas de vehículos pesados (camiones, colectivos, tractores). Permite llevar el control completo del taller: clientes, cajas, reparaciones, presupuestos en PDF y fotos.

---

## Stack Técnico

| Capa | Tecnología |
|---|---|
| Framework | React 18 + Vite 5 |
| Lenguaje | JavaScript (ES2024) |
| UI | Tailwind CSS + componentes propios |
| Auth | JWT (JSON Web Tokens) |
| Backend | Node.js + Express 4 |
| DB | PostgreSQL 18 |
| Storage | Cloudinary (fotos en la nube) |
| PDF | PDFKit |
| PWA | vite-plugin-pwa + Workbox |
| Deploy | Railway |

---

## Funcionalidades

- Registro de clientes y cajas con historial completo de reparaciones
- Flujo de estados: `ingresada → presupuestada → aprobada → terminada → entregada`
- Presupuestos con generación de PDF
- Registro de trabajos realizados
- Galería de fotos por reparación (con cámara desde el celular)
- Dashboard con resumen por estado
- Roles: administrador y técnico
- Instalable como app desde el navegador (PWA)

---

## Estructura del proyecto

```
/
├── client/          # Frontend React + Vite
└── server/          # Backend Node.js + Express
```

---

## Correr localmente

### Requisitos
- Node.js 18+
- PostgreSQL
- Cuenta en Cloudinary (gratuita)

### 1. Instalar dependencias

```bash
cd server
npm install

cd ../client
npm install
```

### 2. Configurar variables de entorno

Copiá `server/.env.example` a `server/.env` y completá los valores:

```env
PORT=3001
DATABASE_URL=postgresql://postgres:TU_PASSWORD@localhost:5432/cajas_automaticas
JWT_SECRET=un_secreto_largo_y_seguro
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

### 3. Crear la base de datos

En psql:
```sql
CREATE DATABASE cajas_automaticas;
```

### 4. Cargar datos iniciales

```bash
cd server
node seed.js
```

Usuarios creados:
| Email | Contraseña | Rol |
|---|---|---|
| admin@taller.com | admin1234 | Admin |
| tecnico@taller.com | tecnico1234 | Técnico |
| ana@taller.com | ana1234 | Técnico |
| cinthia@taller.com | cinthia1234 | Técnico |

### 5. Levantar la aplicación

Terminal 1 — servidor:
```bash
cd server
npm run dev
```

Terminal 2 — cliente:
```bash
cd client
npm run dev
```

Abrí `http://localhost:5173` en el navegador.

---

## Deploy

El proyecto está configurado para deployar en **Railway**. Conectar el repositorio de GitHub y configurar las variables de entorno en el panel de Railway.
