describe('Dashboard Functionality', () => {
  beforeEach(() => {
    // Mock authenticated user
    cy.mockApiResponse('GET', '/api/auth/me', {
      success: true,
      data: {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        pointsBalance: 150,
        skillsOffered: ['JavaScript', 'React'],
        averageRating: 4.5
      }
    });

    cy.mockApiResponse('GET', '/api/notifications', {
      success: true,
      data: [
        {
          id: 1,
          title: 'New Message',
          message: 'You have a new message',
          type: 'new_message',
          isRead: false
        }
      ]
    });
  });

  it('should display user statistics', () => {
    cy.mockApiResponse('GET', '/api/exchanges/my-exchanges', {
      success: true,
      data: []
    });

    cy.login();
    
    // Check if statistics are displayed
    cy.get('h4').should('contain', '150'); // Points balance
    cy.get('h4').should('contain', '4.5'); // Average rating
    cy.get('h4').should('contain', '0'); // Total exchanges
    cy.get('h4').should('contain', '1'); // Unread messages
  });

  it('should show quick action buttons', () => {
    cy.mockApiResponse('GET', '/api/exchanges/my-exchanges', {
      success: true,
      data: []
    });

    cy.login();
    
    // Check quick action buttons
    cy.get('button').should('contain', 'Find Teachers');
    cy.get('button').should('contain', 'Update Profile');
    cy.get('button').should('contain', 'View Messages');
    
    // Test button functionality
    cy.get('button').contains('Find Teachers').click();
    cy.url().should('include', '/search');
    
    cy.go('back');
    cy.get('button').contains('Update Profile').click();
    cy.url().should('include', '/profile');
  });

  it('should display recent notifications', () => {
    cy.mockApiResponse('GET', '/api/exchanges/my-exchanges', {
      success: true,
      data: []
    });

    cy.login();
    
    // Check recent activity section
    cy.get('h6').should('contain', 'Recent Activity');
    cy.get('li').should('contain', 'New Message');
    cy.get('li').should('contain', 'You have a new message');
  });

  it('should show no activity message when no notifications', () => {
    cy.mockApiResponse('GET', '/api/notifications', {
      success: true,
      data: []
    });

    cy.mockApiResponse('GET', '/api/exchanges/my-exchanges', {
      success: true,
      data: []
    });

    cy.login();
    
    cy.get('li').should('contain', 'No recent activity');
    cy.get('li').should('contain', 'Start by searching for skills to learn!');
  });

  it('should display user exchanges', () => {
    const mockExchanges = [
      {
        id: 1,
        skill: 'JavaScript',
        description: 'Learn JavaScript fundamentals',
        status: 'Pending',
        requesterID: 1,
        providerID: 2,
        requesterName: 'Test User',
        providerName: 'John Teacher',
        createdAt: '2024-01-01T00:00:00Z',
        scheduledDate: '2024-01-15T10:00:00Z'
      },
      {
        id: 2,
        skill: 'React',
        description: 'Learn React hooks',
        status: 'Accepted',
        requesterID: 1,
        providerID: 3,
        requesterName: 'Test User',
        providerName: 'Jane Teacher',
        createdAt: '2024-01-02T00:00:00Z'
      }
    ];

    cy.mockApiResponse('GET', '/api/exchanges/my-exchanges', {
      success: true,
      data: mockExchanges
    });

    cy.login();
    
    // Check if exchanges are displayed
    cy.get('h5').should('contain', 'My Exchanges');
    cy.get('li').should('contain', 'JavaScript with John Teacher');
    cy.get('li').should('contain', 'React with Jane Teacher');
    cy.get('span').should('contain', 'Pending');
    cy.get('span').should('contain', 'Accepted');
  });

  it('should filter exchanges by status', () => {
    const mockExchanges = [
      {
        id: 1,
        skill: 'JavaScript',
        status: 'Pending',
        requesterID: 1,
        providerID: 2,
        requesterName: 'Test User',
        providerName: 'John Teacher',
        createdAt: '2024-01-01T00:00:00Z'
      },
      {
        id: 2,
        skill: 'React',
        status: 'Accepted',
        requesterID: 1,
        providerID: 3,
        requesterName: 'Test User',
        providerName: 'Jane Teacher',
        createdAt: '2024-01-02T00:00:00Z'
      }
    ];

    cy.mockApiResponse('GET', '/api/exchanges/my-exchanges', {
      success: true,
      data: mockExchanges
    });

    cy.login();
    
    // Initially all exchanges should be visible
    cy.get('li').should('contain', 'JavaScript with John Teacher');
    cy.get('li').should('contain', 'React with Jane Teacher');
    
    // Click on Pending tab
    cy.get('button').contains('Pending').click();
    
    // Only pending exchanges should be visible
    cy.get('li').should('contain', 'JavaScript with John Teacher');
    cy.get('li').should('not.contain', 'React with Jane Teacher');
  });

  it('should navigate to exchange details when clicked', () => {
    const mockExchanges = [
      {
        id: 1,
        skill: 'JavaScript',
        status: 'Pending',
        requesterID: 1,
        providerID: 2,
        requesterName: 'Test User',
        providerName: 'John Teacher',
        createdAt: '2024-01-01T00:00:00Z'
      }
    ];

    cy.mockApiResponse('GET', '/api/exchanges/my-exchanges', {
      success: true,
      data: mockExchanges
    });

    cy.login();
    
    // Click on exchange
    cy.get('li').contains('JavaScript with John Teacher').click();
    
    // Should navigate to exchange details
    cy.url().should('include', '/exchange/1');
  });

  it('should show no exchanges message when empty', () => {
    cy.mockApiResponse('GET', '/api/exchanges/my-exchanges', {
      success: true,
      data: []
    });

    cy.login();
    
    cy.get('h6').should('contain', 'No exchanges found');
    cy.get('p').should('contain', "You haven't created any exchanges yet. Start by finding a teacher!");
    cy.get('button').should('contain', 'Find Teachers');
  });

  it('should handle exchange loading error', () => {
    cy.intercept('GET', '/api/exchanges/my-exchanges', {
      statusCode: 500,
      body: { success: false, message: 'Server error' }
    });

    cy.login();
    
    cy.get('.MuiAlert-root').should('contain', 'Failed to load exchanges');
  });

  it('should show new exchange button', () => {
    cy.mockApiResponse('GET', '/api/exchanges/my-exchanges', {
      success: true,
      data: []
    });

    cy.login();
    
    cy.get('button').contains('New Exchange').click();
    cy.url().should('include', '/search');
  });
});
