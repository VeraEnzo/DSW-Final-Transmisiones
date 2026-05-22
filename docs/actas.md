# Actas de Avance — Cajas Automáticas

Registro cronológico del desarrollo del proyecto. Trabajo individual.  
**Integrante:** Vera, Enzo  
**Período:** Abril — Mayo 2026  

---

## Semana 1 — 07/04/2026

**Actividades:**
- Definición del dominio del problema: taller de reparación de cajas automáticas
- Diseño del esquema de base de datos (tablas: usuarios, clientes, cajas, reparaciones, items_presupuesto, items_reparados, fotos)
- Scaffold del proyecto: estructura `/client` + `/server`, configuración de Express y Vite
- Implementación de autenticación JWT con roles (admin/tecnico)
- CRUD base de clientes y cajas

**Resultado:** Estructura del proyecto funcionando localmente con autenticación y primeras rutas.

---

## Semana 2 — 10/04/2026

**Actividades:**
- Implementación del módulo de reparaciones con flujo de estados (`ingresada → presupuestada → aprobada → terminada → entregada`)
- Desarrollo del dashboard con estadísticas por estado
- Mejoras de autenticación: perfil de usuario, protección de rutas por rol
- Integración de Cloudinary para subida de fotos
- Lightbox para galería de fotos por reparación
- Branding y ajustes visuales generales

**Resultado:** Flujo principal del negocio implementado end-to-end.

---

## Semana 3 — 14/04/2026

**Actividades:**
- Agregado campo CUIT en clientes
- Implementación de funcionalidad de baja con validación de dependencias (no se puede borrar cliente con cajas, ni caja con reparaciones)
- Migración de generación de PDF a PDFKit (reemplazo de `@react-pdf/renderer` por incompatibilidad ESM en backend)
- Corrección de bug `ERR_REQUIRE_ESM` en carga dinámica de módulos
- Fixes de UX en formularios y navegación
- Escritura de suite completa de tests de integración: **26 tests** en 3 suites (auth, clientes, presupuesto) con Jest + Supertest
- Documentación de pruebas manuales (smoke testing)
- Preparación inicial para deploy en Railway

**Resultado:** Sistema estable con cobertura de tests y listo para deploy.

---

## Semana 4 — 16/04/2026

**Actividades:**
- Agregado tipo de vehículo `pulverizadora` al enum de cajas
- Redacción del manual de usuario (manual-usuario.md + PDF)
- Subida de archivos finales al repositorio

**Resultado:** Documentación de usuario completa.

---

## Semana 5 — 04/05/2026 al 06/05/2026

**Actividades:**
- Revisión general del proyecto en el contexto de los requisitos de la cátedra
- Escritura de tests unitarios de frontend con Vitest + React Testing Library (componente `ReparacionNueva`)
- Escritura de tests E2E con Cypress (flujo de autenticación)
- Documentación completa de la API REST (`api-docs.md`)
- Documentación del reporte de tests frontend (`tests-frontend.md`)
- Mejoras al README

**Resultado:** Cobertura de tests completa (backend + frontend unitario + E2E). Documentación técnica finalizada.

---

## Semana 6 — 18/05/2026 al 19/05/2026

**Actividades:**
- Análisis de viabilidad de Railway free tier: conclusión de inviabilidad a largo plazo ($1 USD/mes no cubre el costo real de ~$31 USD/mes)
- Diseño e implementación de arquitectura multicloud gratuita: Vercel (frontend) + Render (backend) + Neon (PostgreSQL)
- Configuración de CORS dinámico via variable de entorno `CORS_ORIGIN`
- Configuración de `VITE_API_URL` para desacoplamiento frontend/backend
- Eliminación de lógica de serving estático desde Express (innecesaria con Vercel)
- Deploy exitoso en producción: https://dsw-final-transmisiones.vercel.app
- Ejecución del seed en Neon con datos de prueba
- Actualización del README con URL de producción y nueva arquitectura
- Creación de documentación de la carpeta `docs/`

**Resultado:** Sistema deployado y accesible en producción de forma gratuita e indefinida.
