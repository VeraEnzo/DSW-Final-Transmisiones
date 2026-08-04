# Propuesta del Sistema — Cajas Automáticas

**Materia:** Desarrollo de Software — UTN FRRO  
**Integrante:** Vera, Enzo  
**Repositorio:** https://github.com/VeraEnzo/DSW-Final-Transmisiones  
**Deploy:** https://dsw-final-transmisiones.vercel.app  
**Video explicativo:** https://drive.google.com/file/d/109EWEGwsBpWQyf5f-WfghVKki0z_a1Tp/view?usp=sharing  
**Contacto para coordinar la defensa:** enzovera646@gmail.com  

---

## Pull Requests

El desarrollo se realizó sobre la rama `main`; el registro de avance es el historial de commits detallado al final de este documento. Los ajustes finales previos a la entrega se integraron vía pull request:

| Pull Request | Contenido |
|---|---|
| [#1](https://github.com/VeraEnzo/DSW-Final-Transmisiones/pull/1) | Backend: silenciado del log de errores esperados en los tests. Documentación: historial de commits completo y acta de la etapa de migración a Sequelize |

Los issues del repositorio están habilitados para el seguimiento de la cátedra.

---

## Descripción del Sistema

Sistema web PWA para la gestión integral de un taller de reparación de cajas automáticas de vehículos pesados (camiones, colectivos, tractores, pulverizadoras). Permite llevar el control completo del taller: clientes, cajas, órdenes de reparación, presupuestos en PDF y registro fotográfico.

El sistema está basado en un caso de uso real de un taller de la ciudad de Rosario.

---

## Problema que Resuelve

Los talleres especializados en cajas automáticas manejan un flujo de trabajo complejo: cada caja puede tener múltiples reparaciones a lo largo del tiempo, cada reparación tiene un ciclo de vida definido (desde el ingreso hasta la entrega), y se necesita generar presupuestos formales y registrar los trabajos realizados. Sin un sistema digital, este seguimiento se hace en papel o planillas, lo que genera errores y pérdida de información.

---

## Alcance Funcional

### CRUDs Simples
- **Clientes:** alta, consulta, edición y baja con validación de dependencias
- **Cajas:** alta, consulta, edición y baja con validación de dependencias
- **Usuarios:** alta, consulta y baja (solo administrador)

### CRUDs Dependientes
- **Reparaciones:** dependen de una caja (y por ende de un cliente)
- **Ítems de presupuesto:** dependen de una reparación
- **Ítems reparados:** dependen de una reparación
- **Fotos:** dependen de una reparación, almacenadas en Cloudinary

### Listados con Filtros
- Clientes: búsqueda por nombre o empresa (sin tildes vía extensión `unaccent`)
- Cajas: filtro por número de serie, cliente y tipo de vehículo
- Reparaciones: filtro por estado del flujo de trabajo

### Funcionalidades de Negocio
- **Flujo de estados:** `ingresada → presupuestada → aprobada → terminada → entregada / rechazada`
- **Generación de PDF:** presupuesto descargable por reparación (@react-pdf/renderer)
- **Galería de fotos:** upload a Cloudinary con soporte de cámara móvil
- **Dashboard:** resumen estadístico de órdenes por estado
- **Control de acceso por rol:** Admin y Técnico con rutas protegidas diferenciadas

---

## Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | React 18 + Vite 5 |
| Estilos | Tailwind CSS |
| Backend | Node.js + Express 4 |
| ORM | Sequelize |
| Base de datos | PostgreSQL (Neon en producción) |
| Autenticación | JWT |
| Almacenamiento | Cloudinary |
| PDF | @react-pdf/renderer |
| PWA | vite-plugin-pwa + Workbox |
| Tests Backend | Jest + Supertest |
| Tests Frontend | Vitest + React Testing Library + Cypress |
| Deploy Frontend | Vercel |
| Deploy Backend | Render |
| Deploy DB | Neon |

---

## Historial de Commits

El desarrollo se realizó en la rama `main` del repositorio. A continuación el historial completo:

| Fecha | Commit |
|---|---|
| 07/04/2026 | Initial commit |
| 09/04/2026 | Add README |
| 10/04/2026 | Add auth improvements, dashboard, profile, photo lightbox and branding |
| 14/04/2026 | Add CUIT field, delete functionality, PDF migration, UX fixes and manual test docs |
| 14/04/2026 | Add integration test suite with Jest + Supertest (26 tests, 3 suites) |
| 14/04/2026 | Prepare for Railway deploy: serve frontend static build from Express |
| 14/04/2026 | Fix ERR_REQUIRE_ESM: load @react-pdf/renderer via dynamic import() |
| 16/04/2026 | Add user manual documentation |
| 16/04/2026 | Add 'pulverizadora' as vehicle type option |
| 17/04/2026 | Add files via upload |
| 04/05/2026 | Initial commit: Estructura base del sistema de gestión de cajas |
| 06/05/2026 | Docs & Testing: Finalizada la documentación de API y los tests de Vitest/Cypress |
| 18/05/2026 | Enhance README with more project details |
| 19/05/2026 | Deploy: migrate to Vercel + Render + Neon multicloud architecture |
| 19/05/2026 | Fix: remove static frontend serving from Express |
| 19/05/2026 | docs: update README with production URL and correct deploy stack |
| 21/05/2026 | docs: add docs/README, propuesta, actas and reorganize documentation |
| 30/07/2026 | feat(server): migrate data layer to Sequelize ORM |
| 30/07/2026 | test(server): mock ESM PDF generator in presupuesto suite |
| 30/07/2026 | docs: document Sequelize layer, fix PDF stack and add video script |
| 30/07/2026 | chore: add CLAUDE.md with repo guidance for Claude Code |
| 30/07/2026 | fix(fotos): evitar imágenes huérfanas en Cloudinary al fallar la subida |
| 04/08/2026 | fix(server): silenciar el log de errores esperados durante los tests |
