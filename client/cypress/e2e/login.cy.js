describe('Flujo de Autenticación (Login E2E)', () => {
  it('debe permitir a un administrador iniciar sesión y acceder al Dashboard', () => {
    // 1. Visitar la página raíz (que debería renderizar el login)
    cy.visit('/');

    // 2. Llenar el formulario de inicio de sesión
    cy.get('input[type="email"]').type('admin@taller.com');
    cy.get('input[type="password"]').type('admin1234');

    // Interceptamos la llamada a la API de login
    cy.intercept('POST', '**/api/auth/login').as('loginRequest');

    // 3. Hacer clic en el botón de envío
    cy.get('button[type="submit"]').click();

    // Esperamos a que el backend procese el login y responda con 200 (éxito)
    cy.wait('@loginRequest').its('response.statusCode').should('eq', 200);

    // 4. Comprobar que entramos correctamente buscando un elemento fijo del dashboard
    // (Usamos "Nueva caja" porque "Ingresadas" podría no mostrarse si la DB está vacía, 
    // y no verificamos la URL porque la app renderiza el dashboard en la ruta raíz "/")
    cy.contains(/Nueva caja/i, { timeout: 10000 }).should('be.visible');
  });

  it('debe mostrar un mensaje de error si las credenciales son incorrectas', () => {
    cy.visit('/');
    cy.get('input[type="email"]').type('admin@taller.com');
    cy.get('input[type="password"]').type('clave_incorrecta');
    cy.get('button[type="submit"]').click();

    cy.contains('Credenciales inválidas').should('be.visible');
  });
});