# Manual de Usuario — Sistema de Gestión de Reparaciones
### Agro-Transmisiones Rosario SAS

---

## Índice

1. [Acceso al sistema](#1-acceso-al-sistema)
2. [Dashboard](#2-dashboard)
3. [Clientes](#3-clientes)
4. [Cajas](#4-cajas)
5. [Reparaciones](#5-reparaciones)
6. [Presupuesto y PDF](#6-presupuesto-y-pdf)
7. [Trabajos realizados](#7-trabajos-realizados)
8. [Fotos](#8-fotos)
9. [Usuarios (solo admin)](#9-usuarios-solo-admin)
10. [Mi perfil](#10-mi-perfil)
11. [Roles y permisos](#11-roles-y-permisos)
12. [Flujo completo de una reparación](#12-flujo-completo-de-una-reparación)

---

## 1. Acceso al sistema

### Iniciar sesión
Ingresá tu email y contraseña en la pantalla de login. Si el sistema te devuelve "Credenciales inválidas", verificá el email y la contraseña.

### Registrarse
Si es la primera vez, hacé clic en **Crear cuenta** e ingresá tu nombre, email y contraseña (mínimo 6 caracteres). Tu cuenta se crea con rol **técnico** por defecto. Un administrador puede promoverte a admin si hace falta.

### Olvidé mi contraseña
Hacé clic en **¿Olvidaste tu contraseña?** e ingresá tu email. Un administrador recibirá la solicitud, generará una contraseña temporal y te la comunicará. Luego podés cambiarla desde **Mi perfil**.

### Cerrar sesión
En la barra lateral (o menú inferior en celular), hacé clic en el botón de cierre de sesión.

---

## 2. Dashboard

Es la pantalla principal al entrar al sistema. Muestra un resumen del estado actual del taller:

- **Ingresadas** — reparaciones recién recibidas, sin presupuesto
- **Presupuestadas** — esperando aprobación del cliente
- **Aprobadas** — en proceso de reparación
- **Terminadas** — listas para entregar

Cada sección muestra hasta 4 reparaciones recientes con enlace directo. Si hay más, aparece un botón **"Ver N más"**.

Desde el dashboard también podés ir directamente a crear una nueva caja con el botón **+ Nueva caja**.

---

## 3. Clientes

### Ver clientes
En el menú, entrá a **Clientes**. Podés buscar por nombre o empresa en tiempo real, sin necesidad de tildes (buscando "logistica" encuentra "Logística SA").

### Crear cliente
Hacé clic en **+ Nuevo cliente** e ingresá:
- **Nombre** (obligatorio)
- Empresa
- Teléfono
- Email
- CUIT (se formatea automáticamente como `XX-XXXXXXXX-X`)

### Ver / editar cliente
Hacé clic sobre un cliente para ver su ficha. Desde ahí podés editar sus datos y ver las cajas asociadas.

### Eliminar cliente (solo admin)
Un cliente solo puede eliminarse si **no tiene cajas registradas**. Si las tiene, primero hay que eliminar o reasignar las cajas.

---

## 4. Cajas

Las cajas representan las unidades físicas que ingresan al taller (una caja automática con su número de serie).

### Ver cajas
En el menú, entrá a **Cajas**. Podés filtrar por número de serie o por tipo de vehículo.

### Crear caja
Hacé clic en **+ Nueva caja** e ingresá:
- **Número de serie** (obligatorio, debe ser único)
- Tipo de vehículo: Camión / Colectivo / Tractor / Pulverizadora / Otro
- Marca y modelo
- Cliente asociado (buscable)
- Observaciones generales

Si el cliente no existe todavía, podés crearlo directamente desde este formulario.

### Ver / editar caja
Hacé clic sobre una caja para ver su detalle. Desde ahí podés:
- Editar sus datos
- Ver el historial de todas sus reparaciones
- Crear una nueva reparación con **+ Nueva reparación**

### Eliminar caja (solo admin)
Una caja solo puede eliminarse si **no tiene reparaciones registradas**.

---

## 5. Reparaciones

### Crear reparación
Desde el detalle de una caja, hacé clic en **+ Nueva reparación** e ingresá:
- **Fecha de ingreso** (por defecto hoy)
- **Técnico a cargo** (seleccionable del listado de usuarios)
- **Falla declarada** por el cliente

### Ver reparación
Hacé clic sobre cualquier reparación (desde el dashboard, desde una caja, o desde el listado por estado). La reparación tiene 4 tabs:

#### Tab 1: Datos
Muestra y permite editar:
- Fechas de ingreso y egreso
- Técnico asignado
- Falla declarada
- Diagnóstico técnico
- Observaciones finales
- Datos del cliente (solo lectura)

#### Cambiar estado
El selector de estado muestra el progreso de la reparación con botones de avance:

| Estado | Descripción |
|--------|-------------|
| **Ingresada** | Recién recibida, en evaluación |
| **Presupuestada** | Se cargó el presupuesto, esperando aprobación |
| **Aprobada** | Cliente aprobó, en reparación |
| **Terminada** | Reparación finalizada, lista para entregar |
| **Entregada** | Entregada al cliente |
| **Rechazada** | Cliente rechazó el presupuesto |

El sistema solo permite avanzar al siguiente estado lógico. Una vez **entregada** o **rechazada**, la reparación no puede editarse.

### Eliminar reparación (solo admin)
Desde el detalle de la reparación, los administradores pueden eliminarla. Esta acción es irreversible.

---

## 6. Presupuesto y PDF

### Agregar ítems al presupuesto
En el tab **Presupuesto** de la reparación, hacé clic en **+ Agregar ítem** e ingresá:
- **Descripción** (obligatorio)
- Cantidad
- Precio unitario

El sistema calcula automáticamente el subtotal por ítem y el total con IVA (21%).

### Editar o eliminar ítems
Cada ítem tiene íconos para editar o eliminar. Se puede modificar en cualquier estado anterior a "entregada".

### Generar PDF
Hacé clic en el botón **Descargar PDF** para generar el presupuesto oficial. El PDF incluye:
- Datos del taller (razón social, domicilio, CUIT, ingresos brutos)
- Logo de Agro-Transmisiones
- Datos del cliente y CUIT
- Tabla de ítems con precios
- Subtotal, IVA 21% y total
- Número de comprobante y fecha de emisión

---

## 7. Trabajos realizados

En el tab **Trabajos** de la reparación (disponible cuando el estado es **Aprobada** o **Terminada**), podés registrar los trabajos efectivamente realizados:
- Descripción
- Cantidad
- Observación

Este registro es interno y no aparece en el presupuesto del cliente.

---

## 8. Fotos

En el tab **Fotos** de la reparación, podés:

### Subir fotos
Hacé clic en **+ Subir foto**, seleccioná la imagen y elegí una etiqueta:
- **Ingreso** — estado de la caja al recibirla
- **Proceso** — durante la reparación
- **Terminado** — caja reparada
- **Detalle de falla** — falla específica encontrada

### Ver fotos
Hacé clic sobre cualquier foto para abrirla en pantalla completa (lightbox). Podés navegar entre fotos con las flechas o las teclas del teclado.

### Descargar fotos
Dentro del lightbox, hacé clic en el ícono de descarga para guardar la foto.

### Eliminar fotos
Hacé clic en el ícono de eliminación sobre la foto. Se pedirá confirmación.

> Las fotos solo pueden subirse o eliminarse mientras la reparación no esté en estado **Entregada** o **Rechazada**.

---

## 9. Usuarios (solo admin)

Accedé desde el menú **Usuarios**. Esta sección solo es visible para administradores.

### Crear usuario
Hacé clic en **+ Nuevo usuario** e ingresá nombre, email, contraseña y rol (Admin o Técnico).

### Editar usuario
Hacé clic en el ícono de edición. Podés cambiar nombre, email y rol. La contraseña es opcional — si la dejás en blanco, no se modifica.

### Eliminar usuario
Hacé clic en el ícono de eliminar. No podés eliminarte a vos mismo.

### Resetear contraseña
Si un técnico olvidó su contraseña, puede solicitar un reset desde la pantalla de login. Las solicitudes pendientes aparecen en la sección **Solicitudes de reset** dentro de Usuarios. Hacé clic en **Resetear** para generar una contraseña temporal que deberás comunicarle al usuario. Él podrá cambiarla desde **Mi perfil**.

---

## 10. Mi perfil

Accedé desde el menú → **Mi perfil**. Muestra tu nombre, email y rol.

### Cambiar contraseña
Ingresá tu contraseña actual, luego la nueva contraseña (mínimo 6 caracteres) y confirmala. Hacé clic en **Guardar**.

---

## 11. Roles y permisos

| Acción | Técnico | Admin |
|--------|---------|-------|
| Ver dashboard | ✅ | ✅ |
| Ver, crear y editar clientes | ✅ | ✅ |
| Eliminar clientes | ❌ | ✅ |
| Ver, crear y editar cajas | ✅ | ✅ |
| Eliminar cajas | ❌ | ✅ |
| Ver, crear y editar reparaciones | ✅ | ✅ |
| Cambiar estado de reparación | ✅ | ✅ |
| Cargar presupuesto y trabajos | ✅ | ✅ |
| Subir y eliminar fotos | ✅ | ✅ |
| Generar PDF | ✅ | ✅ |
| Eliminar reparaciones | ❌ | ✅ |
| Ver y gestionar usuarios | ❌ | ✅ |
| Resetear contraseñas | ❌ | ✅ |

---

## 12. Flujo completo de una reparación

```
Cliente trae la caja
        │
        ▼
1. Buscar o crear el CLIENTE
        │
        ▼
2. Buscar o crear la CAJA (por número de serie)
        │
        ▼
3. Crear REPARACIÓN
   → Asignar técnico
   → Registrar falla declarada
   [Estado: INGRESADA]
        │
        ▼
4. Evaluar y cargar PRESUPUESTO
   → Agregar ítems con precios
   → Generar PDF para el cliente
   → Avanzar estado
   [Estado: PRESUPUESTADA]
        │
        ├── Cliente rechaza ──► [Estado: RECHAZADA] → Fin
        │
        ▼
5. Cliente aprueba
   [Estado: APROBADA]
        │
        ▼
6. Realizar la reparación
   → Registrar trabajos realizados
   → Subir fotos del proceso
   → Completar diagnóstico técnico
   → Avanzar estado
   [Estado: TERMINADA]
        │
        ▼
7. Cliente retira la caja
   → Registrar observaciones finales
   → Avanzar estado
   [Estado: ENTREGADA] → Fin
```

---

*Sistema desarrollado para Agro-Transmisiones Rosario SAS — v1.0*