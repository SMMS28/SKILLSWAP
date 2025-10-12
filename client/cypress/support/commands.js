// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Custom command to login a user
Cypress.Commands.add('login', (email = 'test@example.com', password = 'password123') => {
  cy.visit('/login');
  cy.get('[data-testid="email-input"]').type(email);
  cy.get('[data-testid="password-input"]').type(password);
  cy.get('[data-testid="login-button"]').click();
  cy.url().should('include', '/dashboard');
});

// Custom command to logout
Cypress.Commands.add('logout', () => {
  cy.get('[data-testid="user-menu"]').click();
  cy.get('[data-testid="logout-button"]').click();
  cy.url().should('eq', Cypress.config().baseUrl + '/');
});

// Custom command to navigate to a page
Cypress.Commands.add('navigateTo', (page) => {
  cy.get(`[data-testid="nav-${page}"]`).click();
  cy.url().should('include', `/${page}`);
});

// Custom command to wait for loading to complete
Cypress.Commands.add('waitForLoading', () => {
  cy.get('[data-testid="loading"]', { timeout: 10000 }).should('not.exist');
});

// Custom command to mock API responses
Cypress.Commands.add('mockApiResponse', (method, url, response) => {
  cy.intercept(method, url, {
    statusCode: 200,
    body: response
  });
});

// Custom command to check if element is visible in viewport
Cypress.Commands.add('isInViewport', (selector) => {
  cy.get(selector).then(($el) => {
    const rect = $el[0].getBoundingClientRect();
    expect(rect.top).to.be.at.least(0);
    expect(rect.bottom).to.be.at.most(Cypress.config().viewportHeight);
    expect(rect.left).to.be.at.least(0);
    expect(rect.right).to.be.at.most(Cypress.config().viewportWidth);
  });
});
