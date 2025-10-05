# 🤝 Contributing to Eqabo Hotel Booking Platform

Thank you for your interest in contributing to Eqabo! This document provides guidelines and instructions for contributing to the project.

---

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [How to Contribute](#how-to-contribute)
4. [Development Process](#development-process)
5. [Pull Request Process](#pull-request-process)
6. [Coding Standards](#coding-standards)
7. [Testing Guidelines](#testing-guidelines)
8. [Documentation](#documentation)
9. [Community](#community)

---

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inspiring community for everyone. Please be respectful and constructive in all interactions.

### Expected Behavior

- ✅ Be respectful and inclusive
- ✅ Provide constructive feedback
- ✅ Accept constructive criticism gracefully
- ✅ Focus on what is best for the community
- ✅ Show empathy towards other community members

### Unacceptable Behavior

- ❌ Harassment or discrimination
- ❌ Trolling or insulting comments
- ❌ Personal or political attacks
- ❌ Publishing others' private information
- ❌ Any conduct that could be considered inappropriate

---

## Getting Started

### Prerequisites

Before contributing, make sure you have:

1. **Read the Documentation**:
   - [Project Overview](PROJECT_OVERVIEW.md)
   - [Developer Guide](DEVELOPER_GUIDE.md)
   - [OpenAPI Guide](OPENAPI_GUIDE.md)

2. **Set Up Development Environment**:
   - Follow the [Developer Guide](DEVELOPER_GUIDE.md) to set up your local environment
   - Fork the repository on GitHub
   - Clone your fork locally

3. **Understand the Project**:
   - Run the application locally
   - Test the API using Postman collections
   - Review existing code and patterns

---

## How to Contribute

### Ways to Contribute

We welcome many types of contributions:

#### 🐛 Bug Reports
Found a bug? Help us fix it!
- Search existing issues first
- Provide detailed reproduction steps
- Include environment details (OS, Node version, etc.)
- Add screenshots if applicable

#### ✨ Feature Requests
Have an idea for a new feature?
- Check existing feature requests
- Explain the use case clearly
- Describe the expected behavior
- Discuss potential implementation approaches

#### 💻 Code Contributions
Ready to write some code?
- Fix bugs
- Implement new features
- Improve performance
- Refactor code
- Add tests

#### 📚 Documentation
Help improve our docs:
- Fix typos or clarify explanations
- Add code examples
- Write tutorials or guides
- Translate documentation
- Update API documentation

#### 🧪 Testing
Improve test coverage:
- Write unit tests
- Add integration tests
- Create end-to-end tests
- Test on different platforms

---

## Development Process

### 1. Choose an Issue

**Option A: Find an Existing Issue**
- Browse [open issues](https://github.com/bitbirr/eqabocoreappfinal/issues)
- Look for issues labeled:
  - `good first issue` - Great for newcomers
  - `help wanted` - We need help with these
  - `bug` - Bug fixes
  - `enhancement` - New features
  - `documentation` - Documentation improvements

**Option B: Create a New Issue**
- Search to avoid duplicates
- Use appropriate issue template
- Provide detailed description
- Wait for feedback before starting work

**Claiming an Issue**:
- Comment on the issue: "I'd like to work on this"
- Wait for approval from maintainers
- Get assigned to the issue

### 2. Fork and Clone

```bash
# Fork the repository on GitHub (use the Fork button)

# Clone your fork
git clone https://github.com/YOUR_USERNAME/eqabocoreappfinal.git
cd eqabocoreappfinal

# Add upstream remote
git remote add upstream https://github.com/bitbirr/eqabocoreappfinal.git

# Verify remotes
git remote -v
```

### 3. Create a Branch

```bash
# Fetch latest changes
git fetch upstream
git checkout main
git merge upstream/main

# Create feature branch
git checkout -b feature/your-feature-name

# Branch naming conventions:
# - feature/add-review-system
# - bugfix/fix-payment-callback
# - docs/update-api-docs
# - refactor/optimize-queries
# - test/add-booking-tests
```

### 4. Make Changes

```bash
# Make your changes
# Follow coding standards
# Write/update tests
# Update documentation

# Test your changes
npm run build    # Check for TypeScript errors
npm test         # Run tests
npm run dev      # Test manually
```

### 5. Commit Changes

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Stage changes
git add .

# Commit with meaningful message
git commit -m "feat: add hotel review system"

# Commit message format:
# <type>(<scope>): <subject>
#
# Types:
# - feat: New feature
# - fix: Bug fix
# - docs: Documentation changes
# - style: Code style changes (formatting)
# - refactor: Code refactoring
# - perf: Performance improvements
# - test: Adding/updating tests
# - chore: Maintenance tasks
#
# Examples:
# feat(auth): add password reset functionality
# fix(booking): resolve date validation error
# docs(api): update OpenAPI specification
# test(payment): add unit tests for callbacks
```

### 6. Push Changes

```bash
# Push to your fork
git push origin feature/your-feature-name
```

### 7. Create Pull Request

1. Go to your fork on GitHub
2. Click "New Pull Request"
3. Select your branch
4. Fill in the PR template
5. Submit for review

---

## Pull Request Process

### PR Template

When creating a PR, include:

```markdown
## Description
Brief description of what this PR does.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Related Issue
Closes #123 (reference the issue number)

## Changes Made
- Added X functionality
- Fixed Y bug
- Updated Z documentation

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed
- [ ] All tests passing

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my code
- [ ] I have commented my code where necessary
- [ ] I have updated the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix/feature works
- [ ] New and existing unit tests pass locally
- [ ] Any dependent changes have been merged
```

### Review Process

1. **Automated Checks**:
   - CI/CD pipeline runs tests
   - Code quality checks
   - Build verification

2. **Code Review**:
   - At least one maintainer review required
   - Address review comments
   - Make requested changes

3. **Approval & Merge**:
   - Once approved, maintainer will merge
   - PR branch will be deleted

### Responding to Reviews

```bash
# Make requested changes
# ... edit files ...

# Commit changes
git add .
git commit -m "refactor: address review comments"

# Push updates
git push origin feature/your-feature-name

# PR will automatically update
```

---

## Coding Standards

### TypeScript Style Guide

**Use Proper Types**:
```typescript
// ✅ Good
interface User {
  id: string;
  name: string;
  email: string;
}

function getUser(id: string): Promise<User | null> {
  // implementation
}

// ❌ Bad
function getUser(id: any): any {
  // implementation
}
```

**Consistent Naming**:
```typescript
// ✅ Good
const userId = '123';
const userName = 'John';
function calculateTotalPrice() { }

// ❌ Bad
const USERID = '123';
const user_name = 'John';
function CalculateTotalPrice() { }
```

**Error Handling**:
```typescript
// ✅ Good
try {
  const result = await someOperation();
  return result;
} catch (error) {
  console.error('Operation failed:', error);
  throw new Error('Meaningful error message');
}

// ❌ Bad
const result = await someOperation(); // No error handling
```

### API Response Format

All API responses must follow this format:

```typescript
// Success
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response payload
  }
}

// Error
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE" // Optional
}
```

### Database Queries

Use TypeORM repository pattern:

```typescript
// ✅ Good
const hotel = await hotelRepository.findOne({
  where: { id: hotelId },
  relations: ['rooms', 'owner']
});

// ❌ Bad
const hotel = await dataSource.query(
  'SELECT * FROM hotels WHERE id = $1',
  [hotelId]
);
```

---

## Testing Guidelines

### Writing Tests

**Test Structure**:
```typescript
describe('Feature/Module', () => {
  beforeAll(async () => {
    // Setup before all tests
  });

  afterAll(async () => {
    // Cleanup after all tests
  });

  beforeEach(() => {
    // Setup before each test
  });

  afterEach(() => {
    // Cleanup after each test
  });

  describe('Specific functionality', () => {
    it('should do something specific', async () => {
      // Arrange
      const input = 'test input';

      // Act
      const result = await functionUnderTest(input);

      // Assert
      expect(result).toBe('expected output');
    });
  });
});
```

**Test Coverage Requirements**:
- New features: 80% minimum coverage
- Bug fixes: Add tests that would have caught the bug
- Critical paths: 100% coverage

**Running Tests**:
```bash
# Run all tests
npm test

# Run specific test file
npm test -- auth.test.ts

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### Manual Testing

Before submitting a PR:

1. **Test Locally**:
   - Start the server
   - Test affected endpoints
   - Verify expected behavior
   - Check for errors in logs

2. **Use Postman**:
   - Run related Postman collections
   - Verify all requests succeed
   - Check response data

3. **Edge Cases**:
   - Test with invalid input
   - Test with missing data
   - Test boundary conditions
   - Test error scenarios

---

## Documentation

### Documentation Standards

**Code Comments**:
```typescript
/**
 * Calculate the total booking price including all fees
 * 
 * @param nights - Number of nights for the booking
 * @param pricePerNight - Room price per night in ETB
 * @param fees - Additional fees object
 * @returns Total price in ETB
 * 
 * @example
 * const total = calculateTotal(3, 2000, { tax: 100 });
 * // Returns: 6100
 */
function calculateTotal(
  nights: number,
  pricePerNight: number,
  fees: { tax: number }
): number {
  return nights * pricePerNight + fees.tax;
}
```

**API Documentation**:

All API endpoints must be documented using Swagger/JSDoc:

```typescript
/**
 * @swagger
 * /api/hotels:
 *   get:
 *     summary: Get list of hotels
 *     description: Retrieve a paginated list of hotels with optional filters
 *     tags: [Hotels]
 *     parameters:
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Filter by city name
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of results per page
 *     responses:
 *       200:
 *         description: Hotels retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HotelListResponse'
 */
```

**README Updates**:

If your changes affect:
- Installation process → Update main README
- API usage → Update API documentation
- Configuration → Update relevant docs
- New features → Add to feature list

---

## Community

### Getting Help

**Stuck?** Here's how to get help:

1. **Search Existing Resources**:
   - Check [documentation](docs/)
   - Search [closed issues](https://github.com/bitbirr/eqabocoreappfinal/issues?q=is%3Aissue+is%3Aclosed)
   - Read [discussions](https://github.com/bitbirr/eqabocoreappfinal/discussions)

2. **Ask Questions**:
   - Open a [discussion](https://github.com/bitbirr/eqabocoreappfinal/discussions/new)
   - Tag it with appropriate labels
   - Provide context and details

3. **Report Issues**:
   - If you found a bug, create an [issue](https://github.com/bitbirr/eqabocoreappfinal/issues/new)
   - Use the bug report template
   - Include reproduction steps

### Communication Channels

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: Questions, ideas, and general discussions
- **Pull Requests**: Code review and collaboration
- **Email**: support@eqabo.com (for sensitive matters)

### Recognition

We value all contributions! Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Acknowledged in documentation
- Invited to join the core team (for significant contributors)

---

## Quick Reference

### Common Commands

```bash
# Setup
npm install                    # Install dependencies
npm run build                  # Build project
npm run dev                    # Start dev server

# Database
npm run migration:run          # Run migrations
npm run seed                   # Seed database

# Testing
npm test                       # Run tests
npm run test:coverage          # Run with coverage

# Git
git checkout -b feature/name   # Create branch
git add .                      # Stage changes
git commit -m "type: message"  # Commit
git push origin feature/name   # Push branch
```

### Issue Labels

- `good first issue` - Good for newcomers
- `help wanted` - Extra attention needed
- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Documentation improvements
- `question` - Further information requested
- `wontfix` - This will not be worked on
- `duplicate` - Already exists
- `invalid` - Invalid issue

---

## Thank You! 🎉

Thank you for contributing to Eqabo! Your efforts help make hotel booking in Ethiopia better for everyone.

**Happy coding!** 💻✨

---

**Document Version**: 1.0  
**Last Updated**: January 2025  
**Maintained By**: Eqabo Team
