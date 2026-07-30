# Guion del Video — Entrega Final

**Sistema:** Cajas Automáticas — Gestión de Reparaciones
**Materia:** Desarrollo de Software — UTN FRRO
**Integrante:** Vera, Enzo
**Duración objetivo:** 10–14 minutos

> **Objetivo del video (según la cátedra):** *"Video explicando el funcionamiento del sistema."* No alcanza con mostrar pantallas: hay que **explicar** mientras se demuestra, y dejar en evidencia que se cumplen los requisitos técnicos y funcionales de la **Aprobación**.

---

## Checklist de lo que el video DEBE demostrar

Marcá mentalmente cada uno mientras grabás — todos aparecen en el guion:

- [ ] Login con autenticación (JWT) y **2 niveles de acceso** (Admin / Técnico)
- [ ] **Protección de rutas** por rol (que un técnico NO ve "Usuarios", que se redirige sin token)
- [ ] **CRUD simple** completo (Clientes o Cajas: alta, lista, detalle, edición, baja)
- [ ] **CRUD dependiente** (Reparación que depende de Caja; ítems que dependen de Reparación)
- [ ] **Listado con filtro** (búsqueda de clientes / filtro de cajas / reparaciones por estado)
- [ ] **Vista de detalle** al seleccionar un ítem de una lista
- [ ] **Historia de usuario con valor de negocio** (el flujo de estados de una reparación de punta a punta)
- [ ] **Validación de datos y manejo de errores** (mostrar un error controlado)
- [ ] **Generación de PDF** (descargar el presupuesto)
- [ ] **Responsive / mobile-first** (mostrar la app en vista móvil)
- [ ] Mención del **backend en capas + ORM (Sequelize)** y los **tests** (evidencia)

---

## Antes de grabar — preparación

1. **Datos limpios y realistas:** corré el seed para tener datos de demostración coherentes.
   ```bash
   cd server && node seed.js
   ```
2. **Levantá los dos servidores** (o usá el deploy de producción — ver nota al final).
   ```bash
   npm run dev        # desde la raíz: levanta server + client
   ```
3. **Credenciales a mano** (las del seed):
   - Admin: `admin@taller.com` / `admin1234`
   - Técnico: `tecnico@taller.com` / `tecnico1234`
4. **Cerrá pestañas y notificaciones** que puedan aparecer. Navegador en pantalla completa.
5. **Tené a la vista los datos de la sección siguiente** ("Datos para cargar en vivo") para no perder tiempo pensando qué ingresar.
6. **Audio:** grabá en un lugar silencioso. Hablá pausado. Si te trabás, frená y volvé a empezar la escena (después se corta en edición).

---

## Datos para cargar en vivo

> Datos pensados para que la demo fluya y sea coherente. Tenelos a mano (idealmente en otra pantalla o en el celular). Se usan en las escenas 3 y 4.

### Cliente (Escena 3)
| Campo | Valor |
|---|---|
| Nombre | Marcelo Funes |
| Empresa | Transportes del Litoral SRL |
| Teléfono | 341-5567788 |
| Email | marcelo@translitoral.com |
| CUIT | 30-71299845-2 |

### Caja (Escena 4)
| Campo | Valor |
|---|---|
| N.º de serie | ZF-6HP-2024-118 |
| Tipo de vehículo | camión |
| Marca | ZF |
| Modelo | 6HP602C |
| Cliente | Marcelo Funes |

### Reparación (Escena 4)
| Campo | Valor |
|---|---|
| Técnico | Carlos Técnico |
| Falla declarada | Patina en 3.ª y 4.ª, no sostiene la marcha en subida |
| Diagnóstico técnico | Desgaste de embrague C2 y solenoide de presión con fuga |

### Ítems del presupuesto (Escena 4 — pestaña Presupuesto)
| Descripción | Cant. | Precio unit. |
|---|---:|---:|
| Kit de embrague C2 (discos y platos) | 1 | 185.000 |
| Solenoide de presión EPC | 1 | 96.000 |
| Aceite ATF Dexron VI (20 L) | 1 | 42.000 |
| Mano de obra — overhaul parcial | 1 | 120.000 |
| **Subtotal neto** | | **443.000** |

### Trabajos realizados (Escena 4 — pestaña Trabajos)
| Descripción | Cant. |
|---|---:|
| Reemplazo de kit de embrague C2 | 1 |
| Cambio de solenoide EPC y limpieza de cuerpo de válvulas | 1 |
| Drenaje y carga de aceite ATF nuevo | 1 |

**Foto (pestaña Fotos):** tené guardada en el escritorio una imagen de una caja/transmisión (sirve una de internet) para subirla rápido. Si grabás en el celular, podés usar la cámara en el momento.

---

## ESCENA 1 — Introducción (≈1 min)

**Mostrá:** la pantalla de login con el logo.

**Decí (guion sugerido):**
> "Hola, soy Enzo Vera. Este es el trabajo final de Desarrollo de Software: un sistema web para la gestión de un taller de reparación de cajas automáticas de vehículos pesados, basado en un caso real de un taller de Rosario.
> El problema que resuelve: un taller maneja muchos clientes, cada cliente tiene cajas, y cada caja puede pasar por varias reparaciones a lo largo del tiempo. Cada reparación tiene un ciclo de vida —desde que ingresa hasta que se entrega— y hay que generar presupuestos formales. Hoy eso se lleva en papel; este sistema lo digitaliza.
> Está construido como una aplicación full-stack con frontend y backend separados que se comunican por una API REST. Ahora lo muestro funcionando."

**Tip:** No te extiendas. 60 segundos máximo de intro.

---

## ESCENA 2 — Login + Roles + Protección de rutas (≈2 min)

> Esta escena cubre 2 requisitos pesados: autenticación con 2 niveles y protección de rutas. Hacela con cuidado.

1. **Intentá entrar con credenciales mal** (ej: password incorrecta).
   - **Mostrá** el mensaje de error rojo "Credenciales inválidas".
   - **Decí:** *"El backend valida las credenciales; si fallan, devuelve un 401 y el frontend muestra el error. Las contraseñas se guardan hasheadas con bcrypt, nunca en texto plano."*

2. **Ingresá como Técnico** (`tecnico@taller.com` / `tecnico1234`).
   - **Mostrá** que entra al Dashboard.
   - **Señalá la barra de navegación:** *"Como técnico, en el menú veo Dashboard, Cajas, Clientes y Mi Perfil."*
   - **Decí:** *"Fijate que NO aparece la sección Usuarios — esa es solo para administradores."*

3. **Probá la protección de ruta directa:** en la URL escribí `/usuarios` a mano.
   - **Mostrá** que te redirige al inicio (no te deja entrar).
   - **Decí:** *"Aunque escriba la URL a mano, la ruta está protegida: el sistema verifica el rol y me redirige. La protección está tanto en el frontend como en el backend."*

4. **Cerrá sesión y entrá como Admin** (`admin@taller.com` / `admin1234`).
   - **Mostrá** que ahora SÍ aparece "Usuarios" en el menú.
   - **Decí:** *"Con el rol de administrador, ahora sí tengo acceso a la gestión de usuarios. Estos son los dos niveles de acceso del sistema."*

5. *(Opcional, suma puntos)* Entrá a **Usuarios** y mostrá que el admin puede ver la lista, cambiar el rol de un técnico a admin, o atender una solicitud de reseteo de contraseña.

---

## ESCENA 3 — CRUD simple: Clientes (alta + validación + lista con filtro) (≈2 min)

> Cubre: CRUD simple, validación/manejo de errores, y listado con filtro.

1. **Andá a Clientes.** Mostrá la lista existente.
   - **Decí:** *"Acá está el CRUD de clientes. Tengo la lista completa."*

2. **Usá el buscador.** Escribí parte de un nombre **sin tildes** (ej: "logistica" o "gonzalez").
   - **Mostrá** que filtra correctamente aunque escribas sin tilde.
   - **Decí:** *"El listado tiene búsqueda con filtro. Algo a destacar: la búsqueda ignora tildes, usando la extensión `unaccent` de PostgreSQL. Así 'gonzalez' encuentra a 'González'."*

3. **Creá un cliente nuevo** (Marcelo Funes — ver "Datos para cargar en vivo").
   - **Antes de completar todo**, intentá guardar **sin el nombre** (o con un email inválido).
   - **Mostrá** el error de validación.
   - **Decí:** *"La validación se hace en el backend con Zod. Si mando datos inválidos, devuelve un 400 con el detalle del error, y el frontend lo muestra. Nunca confío solo en el frontend."*
   - **Ahora completá bien y guardá.** Mostrá el cliente creado en la lista.

4. **Entrá al detalle del cliente** (clic en la fila).
   - **Decí:** *"Al seleccionar un cliente veo su detalle, con las cajas asociadas. Esta es la vista de detalle que pide la consigna."*

5. *(Opcional)* Editá un dato y guardá. Mostrá la **baja con validación de dependencias**: intentá borrar un cliente que tiene cajas → mostrá que el sistema lo impide ("No se puede eliminar: el cliente tiene cajas asociadas").
   - **Decí:** *"La baja valida dependencias: no me deja borrar un cliente que tiene cajas, para no romper la integridad de los datos."*

---

## ESCENA 4 — Historia de usuario completa: ciclo de vida de una reparación (≈4 min) ⭐

> **Esta es la escena más importante.** Es la "historia de usuario con valor de negocio" y demuestra el CRUD dependiente, el PDF y el flujo de estados. Dedicale tiempo.

1. **Andá a Cajas.** Mostrá el listado y **el filtro** (por número de serie / tipo de vehículo / cliente).
   - **Decí:** *"Las cajas también tienen un listado con filtros: por número de serie, tipo de vehículo o cliente."*

2. **Creá la caja `ZF-6HP-2024-118`** y asociala a Marcelo Funes (ver "Datos para cargar en vivo").
   - **Decí:** *"Cada caja pertenece a un cliente. Esto es una relación dependiente."*

3. **Desde el detalle de la caja, creá una Reparación nueva** (con la falla declarada de los datos).
   - **Decí:** *"Ahora registro una reparación sobre esta caja. La reparación depende de la caja, que a su vez depende del cliente: este es el CRUD dependiente. Cargo la falla declarada por el cliente."*
   - **Mostrá** la reparación recién creada, en estado **"ingresada"**.

4. **Mostrá el selector de estados** y explicá el flujo:
   - **Decí:** *"Cada reparación sigue un flujo de estados con valor de negocio: ingresada → presupuestada → aprobada → terminada → entregada, o rechazada. Este flujo es el corazón del sistema."*

5. **Pestaña Presupuesto:** cargá los 4 ítems de la tabla de "Datos para cargar en vivo" (kit C2, solenoide, aceite, mano de obra).
   - **Decí:** *"En la pestaña Presupuesto cargo los ítems: repuestos y mano de obra. Estos ítems dependen de la reparación — otro nivel de dependencia."*

6. **Descargá el PDF del presupuesto.**
   - **Abrí el PDF** y mostralo en pantalla.
   - **Decí:** *"El sistema genera el presupuesto en PDF al vuelo, con los datos del taller, el cliente, los ítems, el IVA y el total. Esto es lo que el taller le entrega al cliente."*

7. **Cambiá el estado a "presupuestada", luego "aprobada".**
   - **Pestaña Trabajos:** cargá los 3 trabajos de la tabla de "Datos para cargar en vivo".
   - **Decí:** *"Una vez aprobado el presupuesto, registro los trabajos efectivamente realizados y los repuestos usados."*

8. **Pestaña Fotos:** subí una foto (o mostrá fotos existentes).
   - **Decí:** *"Puedo adjuntar fotos de la reparación. Se suben a Cloudinary, un servicio de almacenamiento en la nube. En el celular se puede usar directamente la cámara."*

9. **Cambiá el estado a "terminada" → "entregada".**
   - **Decí:** *"Y cierro el ciclo: la reparación queda terminada y entregada. Recorrimos toda la historia de usuario de punta a punta."*

---

## ESCENA 5 — Dashboard (≈1 min)

1. **Volvé al Dashboard.**
   - **Mostrá** las tarjetas con los contadores por estado.
   - **Decí:** *"El dashboard da una vista general del taller: cuántas reparaciones hay en cada estado. Las tarjetas son clicables y me llevan al listado filtrado por ese estado."*
   - **Hacé clic** en una tarjeta para mostrar el listado por estado (otro listado con filtro).

---

## ESCENA 6 — Responsive / PWA (≈1 min)

1. **Abrí las DevTools del navegador** (F12) y activá la **vista móvil** (toggle device toolbar).
   - **Navegá** por un par de pantallas en formato celular.
   - **Mostrá** que la navegación pasa a la barra inferior y que todo se adapta.
   - **Decí:** *"La aplicación está diseñada mobile-first y es totalmente responsive. En el celular la navegación se mueve a una barra inferior. Además es una PWA: se puede instalar como app desde el navegador."*

---

## ESCENA 7 — Backend, arquitectura y tests (≈1–2 min)

> No hace falta mostrar mucho código. Mostrá la **estructura** y los **tests corriendo**.

1. **Mostrá el editor con la estructura de carpetas del `server/`:** `routes/`, `controllers/`, `models/`, `middlewares/`, `config/`.
   - **Decí:** *"El backend está organizado en capas: las rutas reciben las peticiones, los controllers tienen la lógica de negocio, y los modelos de Sequelize —el ORM— mapean las tablas de PostgreSQL. La autenticación y el manejo de errores están centralizados en middlewares."*
   - **Abrí `models/index.js`** un segundo: *"Acá están las entidades y sus relaciones declaradas con el ORM."*

2. **Corré los tests** en la terminal:
   ```bash
   cd server && npm test
   ```
   - **Mostrá** el resultado: **26 tests, 3 suites, todos en verde.**
   - **Decí:** *"El backend tiene tests de integración con Jest y Supertest: 26 tests que cubren autenticación, roles, los CRUDs, la validación y la generación del PDF. Todos pasan."*

3. *(Opcional)* Mencioná los tests de frontend: *"El frontend además tiene tests unitarios con Vitest y un test end-to-end con Cypress del ciclo de login."*

---

## ESCENA 8 — Cierre (≈30 seg)

**Decí:**
> "En resumen: una aplicación full-stack con frontend en React y backend en Node con Express y Sequelize sobre PostgreSQL, con autenticación por roles, generación de PDF, almacenamiento de imágenes en la nube, y desplegada en producción sobre Vercel, Render y Neon. Gracias."

- **Mostrá** la URL de producción: `https://dsw-final-transmisiones.vercel.app`

---

## Notas finales

- **¿Grabar contra local o producción?** Producción se ve más profesional y demuestra que el deploy funciona, pero **el primer request a Render puede tardar ~30–50 seg** (el plan free "duerme"). Si grabás contra producción, **despertá el backend entrando una vez antes de grabar**. Si preferís fluidez, grabá contra local y al final mostrá la URL de producción abierta en otra pestaña.
- **Orden de prioridad si te quedás sin tiempo:** Escenas 2 (roles) y 4 (ciclo de reparación) son **imprescindibles**. El resto suma pero esas dos son las que más pesan en la evaluación.
- **No leas el guion monótono.** Usalo como apoyo, pero hablá natural, como si le explicaras a un compañero.
