# Pruebas Manuales — Agrotransmisiones Automáticas

Checklist de smoke testing previo al deploy. Marcar cada caso con ✅ OK / ❌ Falla / ⚠️ Parcial y anotar observaciones.

**Versión testeada:** v1.0.0-pre  
**Fecha:** 13/04/2026  
**Testeado por:** Enzo Vera  
**Entorno:** Local

---

## 1. Autenticación

| # | Caso | Resultado | Observaciones |
|---|------|-----------|---------------|
| 1.1 | Login con credenciales correctas → redirige al dashboard | ✅ | |
| 1.2 | Login con contraseña incorrecta → muestra mensaje de error sin redirigir | ✅ | Muestra "Credenciales inválidas" |
| 1.3 | Login con email inexistente → muestra mensaje de error | ✅ | Muestra "Credenciales inválidas" |
| 1.4 | Registro con datos válidos → crea cuenta y hace login automático | ✅ | |
| 1.5 | Registro con email ya existente → muestra "Este email ya se encuentra registrado" | ✅ | |
| 1.6 | Registro con contraseñas que no coinciden → muestra error antes de enviar | ✅ | Muestra "Las contraseñas no coinciden" |
| 1.7 | Solicitud de reset de contraseña → muestra confirmación de envío | ✅ | |
| 1.8 | Acceder a ruta protegida sin token → redirige a login | ✅ | Con sesión activa redirige al dashboard |
| 1.9 | Cerrar sesión → token eliminado, redirige a login | ✅ | |

---

## 2. Clientes

| # | Caso | Resultado | Observaciones |
|---|------|-----------|---------------|
| 2.1 | Listar clientes → muestra lista correctamente | ✅ | |
| 2.2 | Buscar cliente por nombre → filtra resultados en tiempo real | ✅ | |
| 2.3 | Buscar cliente por empresa → filtra resultados | ✅ | Requería tildes exactas → corregido con extensión `unaccent` |
| 2.4 | Crear cliente con solo nombre → se guarda correctamente | ✅ | |
| 2.5 | Crear cliente con todos los campos (nombre, empresa, teléfono, email, CUIT) | ✅ | CUIT se guardaba sin formato → corregido con autoformato `XX-XXXXXXXX-X` |
| 2.6 | Ver detalle de cliente → muestra todos sus datos y cajas asociadas | ✅ | |
| 2.7 | Editar cliente → los cambios se guardan y se ven reflejados | ✅ | |
| 2.8 | Editar CUIT de cliente existente → se actualiza correctamente | ✅ | |

---

## 3. Cajas

| # | Caso | Resultado | Observaciones |
|---|------|-----------|---------------|
| 3.1 | Listar cajas → muestra lista con número de serie y estado | ✅ | |
| 3.2 | Buscar caja por número de serie | ✅ | |
| 3.3 | Crear caja asociada a un cliente → aparece en detalle del cliente | ✅ | |
| 3.4 | Crear caja sin cliente (campo opcional) | ✅ | No se podía deseleccionar cliente → corregido con botón ✕ y opción "Sin cliente" |
| 3.5 | Ver detalle de caja → muestra datos y lista de reparaciones | ✅ | |
| 3.6 | Editar datos de caja → cambios guardados correctamente | ✅ | Faltaba botón editar → agregado con formulario inline y toast de confirmación |

---

## 4. Reparaciones

| # | Caso | Resultado | Observaciones |
|---|------|-----------|---------------|
| 4.1 | Crear reparación para una caja → aparece en la lista | ✅ | Toast al crear, vuelve a la caja. Admin ve selector de técnicos, técnico ve su nombre prellenado |
| 4.2 | Ver detalle de reparación → muestra todos los campos | ✅ | |
| 4.3 | Editar falla declarada y diagnóstico técnico | ✅ | Fallaba por strings vacíos en fecha → corregido convirtiendo `''` a `null` |
| 4.4 | Cambiar estado de reparación (ingresada → presupuestada → aprobada → terminada → entregada) | ✅ | |
| 4.5 | Cambiar estado a "rechazada" | ✅ | |
| 4.6 | Agregar técnico a la reparación | ✅ | Desde pestaña Datos → Editar. Admin elige de lista, técnico tiene su nombre prellenado |
| 4.7 | Agregar observaciones finales | ✅ | Mismo fix que 4.3 |

---

## 5. Presupuesto (Ítems)

| # | Caso | Resultado | Observaciones |
|---|------|-----------|---------------|
| 5.1 | Agregar ítem con descripción, cantidad y precio → aparece en la lista | ✅ | |
| 5.2 | Agregar ítem sin precio (campo opcional) | ✅ | |
| 5.3 | Editar ítem existente → cambios guardados | ✅ | |
| 5.4 | Eliminar ítem → desaparece de la lista | ✅ | Usaba `confirm()` nativo → reemplazado con ConfirmModal |
| 5.5 | El subtotal y total se calculan correctamente en pantalla | ✅ | |

---

## 6. PDF de Presupuesto

| # | Caso | Resultado | Observaciones |
|---|------|-----------|---------------|
| 6.1 | Descargar PDF → el archivo se descarga sin error | ✅ | |
| 6.2 | El PDF abre correctamente en el visor | ✅ | |
| 6.3 | El PDF muestra correctamente: logo, razón social y datos del taller | ✅ | |
| 6.4 | El PDF muestra número de comprobante y fecha de emisión | ✅ | |
| 6.5 | El PDF muestra nombre y CUIT del cliente | ✅ | Se agregó link al cliente desde reparación y caja |
| 6.6 | El PDF muestra el técnico asignado | ✅ | |
| 6.7 | El PDF lista todos los ítems con cantidad, precio y subtotal | ✅ | |
| 6.8 | El PDF muestra correctamente subtotal, IVA y total | ✅ | |
| 6.9 | PDF con muchos ítems → no se corta el contenido | ✅ | |

---

## 7. Fotos

| # | Caso | Resultado | Observaciones |
|---|------|-----------|---------------|
| 7.1 | Subir foto en una reparación → se muestra en la galería | ✅ | |
| 7.2 | Subir foto con etiqueta (ingreso / proceso / terminado / detalle_falla) | ✅ | |
| 7.3 | Hacer click en foto → se abre el lightbox | ✅ | |
| 7.4 | Navegar entre fotos en el lightbox | ✅ | |
| 7.5 | Eliminar foto → desaparece de la galería | ✅ | |

---

## 8. Navegación y UX general

| # | Caso | Resultado | Observaciones |
|---|------|-----------|---------------|
| 8.1 | Navegación por el menú lateral en desktop | ✅ | |
| 8.2 | Navegación en mobile (menú hamburguesa) | ✅ | Tabla de usuarios se cortaba en mobile → reemplazada con cards responsivas |
| 8.3 | El dashboard muestra métricas actualizadas | ✅ | |
| 8.4 | Los badges de estado muestran el color correcto | ✅ | |
| 8.5 | Los spinners de carga aparecen mientras se espera respuesta | ✅ | |
| 8.6 | Los mensajes de error se muestran correctamente ante fallos de red | ✅ | |

---

## Resumen de resultados

| Módulo | Total casos | ✅ OK | ❌ Falla | ⚠️ Parcial |
|--------|-------------|-------|---------|-----------|
| 1. Auth | 9 | 9 | 0 | 0 |
| 2. Clientes | 8 | 8 | 0 | 0 |
| 3. Cajas | 6 | 6 | 0 | 0 |
| 4. Reparaciones | 7 | 7 | 0 | 0 |
| 5. Presupuesto | 5 | 5 | 0 | 0 |
| 6. PDF | 9 | 9 | 0 | 0 |
| 7. Fotos | 5 | 5 | 0 | 0 |
| 8. UX general | 6 | 6 | 0 | 0 |
| **TOTAL** | **55** | | | |

---

## Bugs encontrados

| # | Módulo | Descripción | Severidad (Alta/Media/Baja) | Estado |
|---|--------|-------------|----------------------------|--------|
| 1 | Clientes | Búsqueda no encontraba resultados sin tildes exactas (ej: "logistica" no hallaba "Logística") | Baja | ✅ Corregido — extensión `unaccent` en PostgreSQL |
| 2 | Clientes | CUIT se guardaba sin separadores al crearlo manualmente | Baja | ✅ Corregido — autoformato `XX-XXXXXXXX-X` en el input |
| 3 | Cajas | No se podía deseleccionar cliente una vez elegido | Media | ✅ Corregido — botón ✕ para limpiar + opción "Sin cliente" en dropdown |
| 4 | Cajas | Faltaba botón de editar en el detalle de caja | Media | ✅ Corregido — formulario inline de edición con toast de confirmación |
| 5 | Reparaciones | "Error al guardar" al editar datos — strings vacíos rechazados por Zod | Media | ✅ Corregido — se convierten a null antes de enviar |
| 6 | Reparaciones | Al crear reparación volvía a la pantalla de creación en lugar de la caja | Baja | ✅ Corregido — navega a `/cajas/:id` con toast |
| 7 | Reparaciones | Técnico no se prellenaba automáticamente para usuarios no admin | Baja | ✅ Corregido — se usa `user.nombre` del contexto, campo readonly |

---

## Notas generales

- **Lightbox sin zoom**: desde el lightbox de fotos no es posible hacer zoom. Pendiente para v1.1.