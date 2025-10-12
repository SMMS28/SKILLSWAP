describe('Navigation Flow', () => {
  beforeEach(() => {
    // Mock authenticated user
    cy.mockApiResponse('GET', '/api/auth/me', {
      success: true,
      data: {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        pointsBalance: 100,
        skillsOffered: ['JavaScript', 'React']
      }
    });

    cy.mockApiResponse('GET', '/api/exchanges/my-exchanges', {
      success: true,
      data: []
    });

    cy.mockApiResponse('GET', '/api/notifications', {
      success: true,
      data: []
    });
  });

  it('should navigate between main pages', () => {
    cy.login();
    
    // Test navigation to different pages
    cy.get('button').contains('Dashboard').click();
    cy.url().should('include', '/dashboard');
    cy.get('h1').should('contain', 'Welcome back, Test User!');
    
    cy.get('button').contains('Profile').click();
    cy.url().should('include', '/profile');
    
    cy.get('button').contains('Messages').click();
    cy.url().should('include', '/messages');
    
    cy.get('button').contains('Transactions').click();
    cy.url().should('include', '/transactions');
  });

  it('should show user menu when authenticated', () => {
    cy.login();
    
    // Check if user menu is visible
    cy.get('[data-testid="user-menu"]').should('be.visible');
    cy.get('button').should('contain', '100 points');
    
    // Click user menu
    cy.get('[data-testid="user-menu"]').click();
    
    // Should show menu items
    cy.get('li').should('contain', 'Profile');
    cy.get('li').should('contain', 'Transactions');
    cy.get('li').should('contain', 'Logout');
  });

  it('should work on mobile devices', () => {
    cy.viewport('iphone-x');
    cy.login();
    
    // Mobile menu button should be visible
    cy.get('[aria-label="open drawer"]').should('be.visible');
    
    // Click mobile menu
    cy.get('[aria-label="open drawer"]').click();
    
    // Mobile navigation should be visible
    cy.get('li').should('contain', 'Home');
    cy.get('li').should('contain', 'Search Skills');
    cy.get('li').should('contain', 'Dashboard');
    cy.get('li').should('contain', 'Profile');
  });

  it('should highlight active page in navigation', () => {
    cy.login();
    
    // Navigate to dashboard
    cy.get('button').contains('Dashboard').click();
    cy.url().should('include', '/dashboard');
    
    // Dashboard button should be highlighted
    cy.get('button').contains('Dashboard').should('have.css', 'color');
    
    // Navigate to profile
    cy.get('button').contains('Profile').click();
    cy.url().should('include', '/profile');
    
    // Profile button should be highlighted
    cy.get('button').contains('Profile').should('have.css', 'color');
  });

  it('should show notifications badge', () => {
    // Mock notifications
    cy.mockApiResponse('GET', '/api/notifications', {
      success: true,
      data: [
        {
          id: 1,
          title: 'New Message',
          message: 'You have a new message',
          type: 'new_message',
          isRead: false
        },
        {
          id: 2,
          title: 'Exchange Accepted',
          message: 'Your exchange was accepted',
          type: 'exchange_accepted',
          isRead: true
        }
      ]
    });

    cy.login();
    
    // Should show notification badge with count
    cy.get('[aria-label="notifications"]').should('be.visible');
    cy.get('.MuiBadge-badge').should('contain', '1');
  });

  it('should handle logo click to go home', () => {
    cy.login();
    
    // Navigate to a different page
    cy.get('button').contains('Profile').click();
    cy.url().should('include', '/profile');
    
    // Click logo
    cy.get('h6').contains('SkillSwap').click();
    
    // Should go to home page
    cy.url().should('eq', Cypress.config().baseUrl + '/');
  });

  it('should show search skills page', () => {
    cy.visit('/search');
    
    // Should show search page
    cy.url().should('include', '/search');
    cy.get('h1').should('contain', 'Search Skills');
  });

  it('should handle 404 page', () => {
    cy.visit('/nonexistent-page');
    
    // Should show 404 page
    cy.get('h1').should('contain', '404');
    cy.get('p').should('contain', 'Page not found');
  });
});
