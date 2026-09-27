describe('Camino exitoso: crear un pedido', () => {
  it('selecciona productos, confirma y verifica el total persistido', () => {
    cy.intercept('POST', '/api/orders').as('createOrder');
    cy.visit('/');
    cy.get('[data-cy="product-espresso"] .add').click();
    cy.get('[data-cy="product-croissant"] .add').click();
    cy.get('[data-cy="cart-espresso"] [data-action="increase"]').click();
    cy.get('[data-cy="quantity-espresso"]').should('have.text', '2');
    cy.get('#cart-total').should('have.text', '$7.25');
    cy.get('#confirm-order').click();
    cy.wait('@createOrder').then(({ request, response }) => {
      expect(request.body.items).to.deep.include.members([{ id: 'espresso', quantity: 2 }, { id: 'croissant', quantity: 1 }]);
      expect(response?.statusCode).to.eq(201);
      expect(response?.body.order.total).to.eq(7.25);
    });
    cy.get('#feedback').should('contain.text', 'Pedido confirmado');
    cy.get('#feedback').invoke('text').should('match', /ORD-[A-F0-9]{8}/);
    cy.request('/api/orders').its('body.orders').should(orders => {
      expect(orders).to.have.length(1);
      expect(orders[0].total).to.eq(7.25);
    });
    cy.screenshot('camino-exitoso-confirmado');
  });
});
