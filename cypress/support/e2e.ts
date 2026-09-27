beforeEach(() => {
  cy.request('POST', '/api/test/reset').its('status').should('eq', 200);
});
