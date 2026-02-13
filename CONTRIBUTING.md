# Contributing Guide

## Development Workflow

### Setup
```bash
git clone <repository>
cd art-commission-platform
npm install
docker-compose up -d
npm run dev
```

### Branch Strategy
- `main`: Production code
- `develop`: Integration branch  
- `feature/*`: Feature branches
- `hotfix/*`: Production fixes

### Commit Convention
Use Conventional Commits format:
```
feat: add user profile endpoint
fix: resolve JWT expiration bug
docs: update API documentation
test: add project creation tests
```

### Code Quality Standards

**TypeScript**
- Enable strict mode
- No `any` types
- Document public APIs with JSDoc
- Use meaningful variable names

**Testing**  
- 80%+ code coverage required
- Unit tests for all business logic
- Integration tests for API endpoints
- E2E tests for critical user journeys

**Code Review**
- All changes require PR review
- Address all review comments
- Keep PRs focused and small
- Update documentation

### Pull Request Process

1. Create feature branch from `develop`
2. Write code and tests
3. Run `npm run lint` and `npm test`
4. Push and create PR
5. Address review feedback
6. Squash and merge after approval

### Release Process

1. Create release branch from `develop`
2. Update version in package.json
3. Update CHANGELOG.md
4. Test thoroughly
5. Merge to `main` and tag
6. Deploy to production

## Questions?

- Check GitHub Discussions
- Review existing documentation
- Ask in team chat

Thank you for contributing!
