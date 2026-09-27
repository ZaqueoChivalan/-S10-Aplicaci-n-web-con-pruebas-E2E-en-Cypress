describe('Validación: no confirmar un pedido vacío', () => {
  it('mantiene el botón deshabilitado y no envía POST', () => {
    cy.intercept('POST', '/api/orders').as('createOrder');
    cy.visit('/');
    cy.get('#cart-items').should('contain.text', 'Tu pedido está vacío');
    cy.get('#confirm-order').should('be.disabled');
    cy.get('@createOrder.all').should('have.length', 0);
    cy.get('#cart-total').should('have.text', '$0.00');
    cy.screenshot('validacion-pedido-vacio');
  });
});
