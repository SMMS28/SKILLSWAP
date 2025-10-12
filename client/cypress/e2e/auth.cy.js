describe('Authentication Flow', () => {
  beforeEach(() => {
    // Mock API responses
    cy.mockApiResponse('POST', '/api/auth/login', {
      success: true,
      data: {
        user: {
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
          pointsBalance: 100
        },
        token: 'mock-token'
      }
    });

    cy.mockApiResponse('GET', '/api/auth/me', {
      success: true,
      data: {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        pointsBalance: 100
      }
    });

    cy.mockApiResponse('GET', '/api/exchanges/my-exchanges', {
      success: true,
      data: []
    });
  });

  it('should allow user to login successfully', () => {
    cy.visit('/login');
    
    // Check if login form is visible
    cy.get('h1').should('contain', 'Welcome Back');
    cy.get('input[name="email"]').should('be.visible');
    cy.get('input[name="password"]').should('be.visible');
    cy.get('button[type="submit"]').should('contain', 'Sign In');
    
    // Fill in login form
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('password123');
    
    // Submit form
    cy.get('button[type="submit"]').click();
    
    // Should redirect to dashboard
    cy.url().should('include', '/dashboard');
    cy.get('h1').should('contain', 'Welcome back, Test User!');
  });

  it('should show error for invalid credentials', () => {
    // Mock failed login
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 401,
      body: {
        success: false,
        message: 'Invalid credentials'
      }
    });

    cy.visit('/login');
    
    cy.get('input[name="email"]').type('invalid@example.com');
    cy.get('input[name="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();
    
    // Should show error message
    cy.get('.MuiAlert-root').should('contain', 'Invalid credentials');
    cy.url().should('include', '/login');
  });

  it('should redirect to login when accessing protected route', () => {
    cy.visit('/dashboard');
    
    // Should redirect to login
    cy.url().should('include', '/login');
    cy.get('h1').should('contain', 'Welcome Back');
  });

  it('should allow user to logout', () => {
    // Login first
    cy.login();
    
    // Check if user is authenticated
    cy.get('[data-testid="user-menu"]').should('be.visible');
    
    // Logout
    cy.logout();
    
    // Should be on home page and show login button
    cy.url().should('eq', Cypress.config().baseUrl + '/');
    cy.get('button').should('contain', 'Login');
  });

  it('should toggle password visibility', () => {
    cy.visit('/login');
    
    const passwordInput = cy.get('input[name="password"]');
    const toggleButton = cy.get('[aria-label="toggle password visibility"]');
    
    // Initially password should be hidden
    passwordInput.should('have.attr', 'type', 'password');
    
    // Click toggle button
    toggleButton.click();
    
    // Password should be visible
    passwordInput.should('have.attr', 'type', 'text');
    
    // Click again to hide
    toggleButton.click();
    
    // Password should be hidden again
    passwordInput.should('have.attr', 'type', 'password');
  });

  it('should navigate to register page from login', () => {
    cy.visit('/login');
    
    cy.get('a').contains('Sign up here').click();
    
    cy.url().should('include', '/register');
    cy.get('h1').should('contain', 'Create Account');
  });
});
