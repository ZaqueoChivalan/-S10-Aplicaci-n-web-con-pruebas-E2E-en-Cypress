describe('Fallo controlado: error de API y recuperación', () => {
  it('muestra el error simulado y permite reintentar', () => {
    cy.visit('/');
    cy.get('[data-cy="product-cappuccino"] .add').click();
    cy.intercept({ method: 'POST', url: '/api/orders', times: 1 }, { statusCode: 503, body: { error: 'Servicio temporalmente no disponible' } }).as('failedOrder');
    cy.get('#confirm-order').click();
    cy.wait('@failedOrder');
    cy.get('#feedback').should('contain.text', 'Servicio temporalmente no disponible');
    cy.get('#cart-items').should('contain.text', 'Cappuccino');
    cy.screenshot('fallo-controlado-error-visible');
    cy.intercept('POST', '/api/orders').as('recoveredOrder');
    cy.get('#confirm-order').click();
    cy.wait('@recoveredOrder').its('response.statusCode').should('eq', 201);
    cy.get('#feedback').should('contain.text', 'Pedido confirmado');
    cy.screenshot('fallo-controlado-recuperado');
  });
});
