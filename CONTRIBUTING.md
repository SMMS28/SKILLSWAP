# Contributing to SkillSwap Learning Network

Thank you for your interest in contributing to SkillSwap! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### Reporting Bugs

1. **Check existing issues** to avoid duplicates
2. **Use the bug report template** when creating a new issue
3. **Include detailed information**:
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (OS, Node.js version, etc.)
   - Error messages and logs

### Suggesting Features

1. **Check existing feature requests** first
2. **Use the feature request template**
3. **Provide clear description** of the feature
4. **Explain the use case** and benefits

### Code Contributions

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes**
4. **Add tests** for new functionality
5. **Ensure all tests pass** (`npm test`)
6. **Commit your changes** (`git commit -m 'Add amazing feature'`)
7. **Push to your branch** (`git push origin feature/amazing-feature`)
8. **Open a Pull Request**

## 🛠️ Development Setup

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Git

### Setup

```bash
# Fork and clone the repository
git clone https://github.com/yourusername/skillswap-learning-network.git
cd skillswap-learning-network

# Install dependencies
npm install
cd client && npm install && cd ..

# Set up environment
cp config/env.example .env
echo "REACT_APP_SERVER_URL=http://localhost:5002" > client/.env

# Initialize database
npm run db:migrate
npm run db:seed

# Start development servers
npm run dev  # Terminal 1
npm run client  # Terminal 2
```

## 📝 Coding Standards

### JavaScript/Node.js

- Use **ES6+** features
- Follow **async/await** pattern for asynchronous code
- Use **const/let** instead of var
- Use **arrow functions** where appropriate
- Add **JSDoc comments** for functions

### React

- Use **functional components** with hooks
- Follow **React best practices**
- Use **Material-UI** components consistently
- Implement **proper error handling**
- Add **PropTypes** for component props

### Database

- Use **parameterized queries** to prevent SQL injection
- Follow **consistent naming conventions**
- Add **proper indexes** for performance
- Include **migration scripts** for schema changes

### Testing

- Write **unit tests** for utility functions
- Write **integration tests** for API endpoints
- Write **component tests** for React components
- Aim for **80%+ code coverage**
- Use **descriptive test names**

## 🧪 Testing Guidelines

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:frontend
```

### Writing Tests

```javascript
// Example unit test
describe('UserService', () => {
  it('should create user with valid data', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    };
    
    const result = await userService.createUser(userData);
    
    expect(result.success).toBe(true);
    expect(result.data.name).toBe(userData.name);
  });
});
```

## 📁 Project Structure

```
skillswap-learning-network/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── contexts/      # React contexts
│   │   ├── pages/         # Page components
│   │   └── config/        # Configuration
├── config/                # Configuration files
├── database/              # Database files
├── routes/                # API routes
├── services/              # Business logic
├── tests/                 # Test files
└── server.js             # Main server file
```

## 🔄 Pull Request Process

### Before Submitting

1. **Update documentation** if needed
2. **Add tests** for new features
3. **Ensure all tests pass**
4. **Check code style** and formatting
5. **Update CHANGELOG.md** if applicable

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] New tests added
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No console.log statements left
```

### Review Process

1. **Automated checks** must pass
2. **Code review** by maintainers
3. **Testing** on different environments
4. **Approval** from at least one maintainer
5. **Merge** by maintainers only

## 🐛 Bug Fix Guidelines

### Before Fixing

1. **Reproduce the bug** locally
2. **Identify the root cause**
3. **Check for similar issues**
4. **Write a failing test** that reproduces the bug

### During Fix

1. **Make minimal changes** to fix the issue
2. **Add tests** to prevent regression
3. **Update documentation** if needed
4. **Test thoroughly** before submitting

## ✨ Feature Development

### Planning

1. **Discuss the feature** in an issue first
2. **Get approval** from maintainers
3. **Break down** into smaller tasks
4. **Estimate effort** and timeline

### Implementation

1. **Start with tests** (TDD approach)
2. **Implement incrementally**
3. **Keep commits small** and focused
4. **Update documentation** as you go

### Completion

1. **Add comprehensive tests**
2. **Update user documentation**
3. **Add to CHANGELOG.md**
4. **Create migration scripts** if needed

## 📚 Documentation

### Code Documentation

- **JSDoc comments** for functions
- **Inline comments** for complex logic
- **README updates** for new features
- **API documentation** for new endpoints

### User Documentation

- **Setup instructions** for new features
- **Usage examples** and tutorials
- **Troubleshooting guides**
- **FAQ updates**

## 🚀 Release Process

### Version Numbering

We follow [Semantic Versioning](https://semver.org/):
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Checklist

1. **Update version** in package.json
2. **Update CHANGELOG.md**
3. **Create release notes**
4. **Tag the release**
5. **Deploy to production**

## 💬 Communication

### Getting Help

- **GitHub Issues** for bugs and features
- **GitHub Discussions** for questions
- **Pull Request comments** for code review
- **Email** for security issues

### Code of Conduct

- **Be respectful** and inclusive
- **Be constructive** in feedback
- **Be patient** with newcomers
- **Be collaborative** in discussions

## 🏆 Recognition

Contributors will be recognized in:
- **CONTRIBUTORS.md** file
- **Release notes**
- **GitHub contributors** page
- **Project documentation**

## 📞 Contact

- **Maintainer**: [Your Name](mailto:your.email@example.com)
- **GitHub**: [@yourusername](https://github.com/yourusername)
- **Project**: [SkillSwap Learning Network](https://github.com/yourusername/skillswap-learning-network)

---

Thank you for contributing to SkillSwap! 🎉
