# Tests Automatizados — Frontend

Este documento detalla la estrategia y ejecución de las pruebas automatizadas para la interfaz de usuario del sistema de gestión de reparaciones. Estas pruebas aseguran que tanto los componentes individuales como los flujos de trabajo completos funcionen de manera correcta y consistente.

---

## 1. Test Unitario (Vitest)

Las pruebas unitarias validan el comportamiento de los componentes de React de forma aislada, asegurando que la lógica de renderizado y la gestión de estados respondan según lo esperado ante las entradas del usuario.

* **Herramientas:** Vitest, React Testing Library, jsdom.
* **Cómo correrlo:** Ejecutar `npm test` en la carpeta `client`.

### Casos de Prueba

| ID | Caso de Prueba | Descripción | Resultado |
| :--- | :--- | :--- | :--- |
| TU-01 | Renderizado de campos | Verifica que todos los campos del formulario de nueva reparación estén presentes en el DOM. | Pasado |
| TU-02 | Validación de botones | Comprueba que el botón de guardado mantenga su estado correcto según la validez del formulario. | Pasado |

### Evidencia de ejecución

```text
 ✓ src/pages/ReparacionNueva.test.jsx (2 tests) 153ms
   ✓ Componente ReparacionNueva (2)
     ✓ debe renderizar correctamente todos los campos del formulario 135ms
     ✓ el campo Fecha de ingreso debe ser obligatorio y el botón no debe estar deshabilitado inicialmente 16ms

 Test Files  1 passed (1)
      Tests  2 passed (2)
   Start at  20:15:17
   Duration  453ms
```

---

## 2. Test End-to-End (Cypress)

Las pruebas End-to-End (E2E) simulan la navegación de un usuario real en el navegador para validar que los flujos críticos de la aplicación (como la autenticación) funcionen correctamente de extremo a extremo.

* **Herramientas:** Cypress.
* **Cómo correrlo:** Ejecutar `npm run test:e2e` en la carpeta `client`.

### Casos de Prueba

| ID | Caso de Prueba | Descripción | Resultado |
| :--- | :--- | :--- | :--- |
| E2E-01 | Login Exitoso | Valida que un administrador pueda iniciar sesión y ser redirigido al Dashboard. | Pasado |
| E2E-02 | Credenciales Inválidas | Verifica que el sistema bloquee el acceso y muestre un error ante datos incorrectos. | Pasado |

### Evidencia de ejecución

```text
  Flujo de Autenticación (Login E2E)
    √ debe permitir a un administrador iniciar sesión y acceder al Dashboard (1344ms)
    √ debe mostrar un mensaje de error si las credenciales son incorrectas (957ms)

  2 passing (2s)
```