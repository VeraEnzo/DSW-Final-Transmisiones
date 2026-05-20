# Documentación de la API — Cajas Automáticas

Base URL local: `http://localhost:3001/api`

Todos los endpoints (excepto los de autenticación pública) requieren el header:
```
Authorization: Bearer <token>
```

Todas las respuestas siguen la estructura:
```json
{ "ok": true, "data": { ... } }
{ "ok": false, "error": "mensaje de error" }
```

---

## Autenticación

### POST `/auth/login`
Inicia sesión y devuelve un JWT.

**Body:**
```json
{ "email": "admin@taller.com", "password": "admin1234" }
```

**Respuesta 200:**
```json
{
  "ok": true,
  "data": {
    "token": "eyJ...",
    "user": { "id": 1, "nombre": "Administrador", "email": "admin@taller.com", "rol": "admin" }
  }
}
```

**Errores:** `401` credenciales inválidas · `400` validación fallida

---

### POST `/auth/register/public`
Registra un usuario nuevo con rol `tecnico` (no requiere autenticación).

**Body:**
```json
{ "nombre": "Juan Pérez", "email": "juan@taller.com", "password": "mipassword" }
```

**Respuesta 201:**
```json
{ "ok": true, "data": { "id": 5, "nombre": "Juan Pérez", "email": "juan@taller.com", "rol": "tecnico" } }
```

**Errores:** `409` email ya registrado · `400` password < 6 caracteres

---

### POST `/auth/register`
Registra un usuario especificando rol. Requiere token de **admin**.

**Body:**
```json
{ "nombre": "Carlos", "email": "carlos@taller.com", "password": "mipassword", "rol": "admin" }
```

**Respuesta 201:** igual a `/register/public`

**Errores:** `401` sin token · `403` no es admin · `409` email duplicado

---

### GET `/auth/me`
Devuelve los datos del usuario autenticado.

**Respuesta 200:**
```json
{ "ok": true, "data": { "id": 1, "nombre": "Administrador", "email": "admin@taller.com", "rol": "admin", "created_at": "..." } }
```

---

## Clientes

Todos los endpoints requieren token. Solo `DELETE` requiere rol **admin**.

### GET `/clientes`
Lista todos los clientes, ordenados por nombre.

**Query params:**
| Param | Tipo | Descripción |
|---|---|---|
| `search` | string | Búsqueda parcial por nombre o empresa (sin tildes) |

**Respuesta 200:**
```json
{ "ok": true, "data": [ { "id": 1, "nombre": "Juan Transportes", "empresa": "...", "telefono": "...", "email": "...", "cuit": "..." } ] }
```

---

### POST `/clientes`
Crea un cliente nuevo.

**Body:**
```json
{
  "nombre": "Juan Transportes",
  "empresa": "Transportes JR S.A.",
  "telefono": "011-4444-1234",
  "email": "juan@transportesjr.com",
  "cuit": "20-12345678-9"
}
```
Solo `nombre` es obligatorio.

**Respuesta 201:** objeto cliente completo.

---

### GET `/clientes/:id`
Devuelve un cliente con sus cajas asociadas.

**Respuesta 200:**
```json
{
  "ok": true,
  "data": {
    "id": 1, "nombre": "...",
    "cajas": [
      { "id": 1, "numero_serie": "ZF-001", "total_reparaciones": 3, "ultimo_estado": "terminada" }
    ]
  }
}
```

**Errores:** `404` cliente no encontrado

---

### PUT `/clientes/:id`
Actualiza campos del cliente (todos opcionales).

**Body:** cualquier subconjunto de los campos de creación.

**Respuesta 200:** objeto cliente actualizado.

**Errores:** `400` sin campos · `404` no encontrado

---

### DELETE `/clientes/:id`
Elimina un cliente. Solo **admin**. Falla si tiene cajas asociadas.

**Respuesta 200:** `{ "ok": true, "data": { "deleted": true } }`

**Errores:** `403` no es admin · `404` no encontrado · `409` tiene cajas asociadas

---

## Cajas

Todos los endpoints requieren token. Solo `DELETE` requiere rol **admin**.

### GET `/cajas`
Lista cajas con datos del cliente vinculado.

**Query params:**
| Param | Tipo | Descripción |
|---|---|---|
| `numero_serie` | string | Filtro parcial por número de serie |
| `id_cliente` | number | Filtrar por cliente |
| `tipo_vehiculo` | string | `camion`, `colectivo`, `tractor`, `pulverizadora`, `otro` |

**Respuesta 200:** array de cajas con `cliente_nombre`, `total_reparaciones`, `ultimo_estado`.

---

### POST `/cajas`
Crea una caja nueva.

**Body:**
```json
{
  "numero_serie": "ZF-6HP-2023-001",
  "tipo_vehiculo": "camion",
  "marca": "ZF",
  "modelo": "6HP600",
  "id_cliente": 1,
  "observaciones_generales": "Texto libre"
}
```
Solo `numero_serie` es obligatorio.

**Respuesta 201:** objeto caja completo.

---

### GET `/cajas/:id`
Devuelve una caja con sus reparaciones y datos del cliente.

**Respuesta 200:**
```json
{
  "ok": true,
  "data": {
    "id": 1, "numero_serie": "ZF-001", "cliente_nombre": "...",
    "reparaciones": [ { "id": 1, "estado": "ingresada", "fecha_ingreso": "..." } ]
  }
}
```

---

### GET `/cajas/serie/:numero_serie`
Busca una caja por número de serie exacto.

**Respuesta 200:** objeto caja con datos del cliente.

**Errores:** `404` no encontrada

---

### PUT `/cajas/:id`
Actualiza campos de la caja.

**Errores:** `400` sin campos · `404` no encontrada

---

### DELETE `/cajas/:id`
Elimina una caja. Solo **admin**. Falla si tiene reparaciones.

**Errores:** `403` · `404` · `409` tiene reparaciones asociadas

---

## Reparaciones

Todos los endpoints requieren token. Solo `DELETE` requiere rol **admin**.

### POST `/reparaciones`
Crea una nueva orden de reparación.

**Body:**
```json
{
  "id_caja": 1,
  "fecha_ingreso": "2025-11-01",
  "tecnico": "Carlos Técnico",
  "falla_declarada": "No entra en marcha atrás"
}
```
Solo `id_caja` es obligatorio. `fecha_ingreso` toma la fecha actual por defecto.

**Respuesta 201:** objeto reparación con estado `ingresada`.

---

### GET `/reparaciones/por-estado`
Lista reparaciones filtradas por estado, con datos de caja y cliente.

**Query params:**
| Param | Tipo | Descripción |
|---|---|---|
| `estado` | string | `ingresada` (default), `presupuestada`, `aprobada`, `terminada`, `entregada`, `rechazada` |

**Respuesta 200:** array con `numero_serie`, `marca`, `modelo`, `cliente_nombre`.

---

### GET `/reparaciones/:id`
Devuelve reparación completa con todos sus sub-recursos.

**Respuesta 200:**
```json
{
  "ok": true,
  "data": {
    "id": 1, "estado": "presupuestada",
    "numero_serie": "ZF-001", "cliente_nombre": "...",
    "items_presupuesto": [ { "id": 1, "descripcion": "Kit embragues", "cantidad": 1, "precio_unitario": 45000 } ],
    "items_reparados": [],
    "fotos": []
  }
}
```

---

### PUT `/reparaciones/:id`
Actualiza datos o cambia de estado.

**Body (todos opcionales):**
```json
{
  "estado": "aprobada",
  "diagnostico_tecnico": "Desgaste en embragues C2 y C3",
  "fecha_egreso": "2025-11-15",
  "observaciones_finales": "Texto libre"
}
```

**Estados válidos:** `ingresada` → `presupuestada` → `aprobada` → `terminada` → `entregada` · `rechazada`

---

### DELETE `/reparaciones/:id`
Elimina reparación y todos sus sub-recursos en cascada. Solo **admin**.

---

## Presupuesto (ítems)

### POST `/reparaciones/:id/presupuesto`
Agrega un ítem al presupuesto de una reparación.

**Body:**
```json
{ "descripcion": "Kit de embragues C2", "cantidad": 1, "precio_unitario": 45000, "observacion": "Incluye discos" }
```
`precio_unitario` es opcional (puede ser `null`).

**Respuesta 201:** objeto ítem creado.

**Errores:** `400` sin descripción

---

### GET `/reparaciones/:id/presupuesto/pdf`
Genera y descarga el presupuesto en PDF.

**Respuesta 200:** archivo PDF con `Content-Type: application/pdf`.

**Errores:** `404` reparación no encontrada

---

### PUT `/presupuesto/:id`
Actualiza un ítem de presupuesto por su ID.

**Errores:** `404` ítem no encontrado

---

### DELETE `/presupuesto/:id`
Elimina un ítem de presupuesto.

**Errores:** `404` ítem no encontrado

---

## Ítems Reparados

### POST `/reparaciones/:id/items`
Registra un trabajo o repuesto utilizado en la reparación.

**Body:**
```json
{ "descripcion": "Rodamiento delantero izquierdo", "cantidad": 1, "observacion": "Reemplazado por SKF" }
```

**Respuesta 201:** objeto ítem creado.

---

## Fotos

### POST `/reparaciones/:id/fotos`
Sube una foto asociada a la reparación. Se almacena en Cloudinary.

**Body:** `multipart/form-data`
| Campo | Tipo | Descripción |
|---|---|---|
| `foto` | File | Imagen (jpg, png, webp) |
| `etiqueta` | string | Etiqueta opcional (ej: "antes", "después") |

**Respuesta 201:**
```json
{ "ok": true, "data": { "id": 1, "url_cloudinary": "https://res.cloudinary.com/...", "etiqueta": "antes" } }
```

---

### DELETE `/fotos/:id`
Elimina una foto de la base de datos y de Cloudinary.

**Errores:** `404` foto no encontrada

---

## Dashboard

### GET `/dashboard`
Devuelve estadísticas generales del taller.

**Respuesta 200:**
```json
{
  "ok": true,
  "data": {
    "por_estado": {
      "ingresada": 2,
      "presupuestada": 1,
      "aprobada": 1,
      "terminada": 3,
      "entregada": 5
    }
  }
}
```

---

## Usuarios

Solo accesible con token de **admin**.

### GET `/usuarios`
Lista todos los usuarios registrados.

### POST `/usuarios`
Crea un usuario (alias de `POST /auth/register` con auth admin).

### DELETE `/usuarios/:id`
Elimina un usuario por ID.

---

## Códigos de error comunes

| Código | Significado |
|---|---|
| `400` | Validación fallida (Zod) o campos faltantes |
| `401` | Sin token o token inválido |
| `403` | Rol insuficiente (se requiere admin) |
| `404` | Recurso no encontrado |
| `409` | Conflicto (email duplicado, recurso con dependencias) |
| `500` | Error interno del servidor |
