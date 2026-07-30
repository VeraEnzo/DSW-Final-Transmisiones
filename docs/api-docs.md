# Documentación de la API — Backend

Este documento detalla los endpoints principales de la API RESTful desarrollada en Node.js y Express para el sistema de gestión de reparaciones. Toda la comunicación se realiza en formato JSON.

## Arquitectura del Backend

El backend sigue una **arquitectura en capas**:

- **Rutas** (`src/routes/`): definen los endpoints y aplican los middlewares de autenticación/autorización.
- **Controllers** (`src/controllers/`): contienen la lógica de negocio y validan la entrada con **Zod**.
- **Modelos / ORM** (`src/models/`): mapeo objeto-relacional con **Sequelize** sobre PostgreSQL. Cada entidad del negocio (Usuario, Cliente, Caja, Reparación, ItemPresupuesto, ItemReparado, Foto, SolicitudReset) es un modelo de Sequelize, con sus asociaciones (`hasMany` / `belongsTo`) declaradas en `src/models/index.js`.
- **Middlewares** (`src/middlewares/`): autenticación JWT, control de rol y manejo centralizado de errores.

Todas las respuestas usan un envelope uniforme: `{ ok: true, data }` en éxito y `{ ok: false, error }` en error.

---

## 1. Autenticación (`/api/auth`)

Manejo de acceso al sistema mediante **JSON Web Tokens (JWT)**. Para los endpoints protegidos, el token debe enviarse en el header `Authorization: Bearer <token>`.

### Iniciar Sesión

- **Método / URL:** `POST /api/auth/login`
- **Descripción:** Verifica las credenciales del usuario y devuelve un token de acceso.

**Parámetros:**
| Nombre | Ubicación | Tipo | Obligatorio | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| `email` | Body | string | Sí | Correo electrónico registrado |
| `password` | Body | string | Sí | Contraseña en texto plano |

**Ejemplo de Respuesta (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "nombre": "Administrador",
    "email": "admin@taller.com",
    "rol": "admin"
  }
}
```

### Registrar Usuario

- **Método / URL:** `POST /api/auth/register`
- **Descripción:** Crea un nuevo usuario en la base de datos (requiere permisos de Admin).

**Parámetros:**
| Nombre | Ubicación | Tipo | Obligatorio | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| `nombre` | Body | string | Sí | Nombre completo |
| `email` | Body | string | Sí | Correo electrónico único |
| `password` | Body | string | Sí | Mínimo 6 caracteres |
| `rol` | Body | string | No | `admin` o `tecnico` (default) |

**Ejemplo de Respuesta (201 Created):**
```json
{
  "message": "Usuario registrado exitosamente",
  "user": {
    "id": 5,
    "nombre": "Nuevo Técnico",
    "email": "nuevo@taller.com",
    "rol": "tecnico"
  }
}
```

---

## 2. Clientes (`/api/clientes`)

### Listar y Buscar Clientes

- **Método / URL:** `GET /api/clientes`
- **Descripción:** Obtiene el listado de clientes. Permite búsqueda aproximada (sin tildes) por nombre o empresa.

**Parámetros:**
| Nombre | Ubicación | Tipo | Obligatorio | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| `q` | Query | string | No | Término de búsqueda |

**Ejemplo de Respuesta (200 OK):**
```json
{
  "data": [
    {
      "id": 1,
      "nombre": "Juan Transportes",
      "empresa": "Transportes JR S.A.",
      "telefono": "011-4444-1234",
      "email": "juan@transportesjr.com",
      "cuit": "30-12345678-9"
    }
  ]
}
```

### Crear Cliente

- **Método / URL:** `POST /api/clientes`
- **Descripción:** Registra un nuevo cliente en el sistema.

**Parámetros:**
| Nombre | Ubicación | Tipo | Obligatorio | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| `nombre` | Body | string | Sí | Nombre del responsable |
| `empresa` | Body | string | No | Razón social |
| `telefono` | Body | string | No | Teléfono de contacto |
| `cuit` | Body | string | No | CUIT con o sin guiones |

**Ejemplo de Respuesta (201 Created):**
```json
{
  "message": "Cliente creado",
  "data": {
    "id": 4,
    "nombre": "Roberto Agro"
  }
}
```

---

## 3. Reparaciones (`/api/reparaciones`)

### Cambiar Estado de Reparación

- **Método / URL:** `PUT /api/reparaciones/:id/estado`
- **Descripción:** Avanza o retrocede el estado de una reparación dentro del flujo lógico (ingresada -> presupuestada -> aprobada -> terminada -> entregada).

**Parámetros:**
| Nombre | Ubicación | Tipo | Obligatorio | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| `id` | Path | int | Sí | ID de la reparación |
| `estado` | Body | string | Sí | Nuevo estado a asignar |

**Ejemplo de Respuesta (200 OK):**
```json
{
  "message": "Estado actualizado correctamente",
  "data": {
    "id": 2,
    "estado": "presupuestada",
    "updated_at": "2023-11-20T10:00:00Z"
  }
}
```

---

## 4. Presupuestos y PDFs (`/api/presupuesto`)

### Agregar Ítem al Presupuesto

- **Método / URL:** `POST /api/presupuesto`
- **Descripción:** Agrega un nuevo concepto (repuesto o mano de obra) al presupuesto de una reparación.

**Parámetros:**
| Nombre | Ubicación | Tipo | Obligatorio | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| `id_reparacion` | Body | int | Sí | ID de la reparación |
| `descripcion` | Body | string | Sí | Detalle del trabajo/repuesto |
| `cantidad` | Body | int | Sí | Cantidad de unidades |
| `precio_unitario` | Body | float | No | Precio sin IVA |

**Ejemplo de Respuesta (201 Created):**
```json
{
  "id": 10,
  "descripcion": "Kit de embragues C2",
  "precio_unitario": 45000.00
}
```

### Descargar PDF del Presupuesto

- **Método / URL:** `GET /api/presupuesto/pdf/:id_reparacion`
- **Descripción:** Genera al vuelo un documento PDF con los datos del taller, cliente, vehículo y tabla de ítems cotizados (calculando IVA y totales).

**Parámetros:**
| Nombre | Ubicación | Tipo | Obligatorio | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| `id_reparacion` | Path | int | Sí | ID de la reparación a cotizar |

**Respuesta (200 OK):**
*Devuelve un stream binario con `Content-Type: application/pdf`.*